import { createConnection, getRepository } from 'typeorm';
import _ from 'lodash';

import { Industry, Capability, DefaultCapability } from '@modules/caps/entities';

import { parseCsv } from '@lib/parseCsv';
import { getPath } from '@lib/getPath';

let connection = null;

async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }
  let root = null;
  let data: any = null;

  const industryRepository = getRepository(Industry);
  const capabilityRepository = getRepository(Capability);
  //const defaultCapabilityRepository = getRepository(DefaultCapability);

  // clear
  //await capabilityRepository.clear();

  // get industries
  let industries = await industryRepository.find();

  // save tree capabilities for each industry
  for (let industry of industries) {
    if (['Telecommunications'].includes(industry.name)) {
      data = await parseCsv(
        `capabilities/${industry.name}.csv`,
        rows =>
          // { '1': {...}, '2': {...} ...}
          rows.reduce((o, row) => {
            const hierarchy_id = getPath(row.hierarchy_id);
            return {
              ...o,
              [hierarchy_id]: {
                ...row,
                hierarchy_id,
                industry,
              },
            };
          }, {}),
        {
          renameHeaders: true,
          headers: ['hierarchy_id', 'name'],
        }
      );
    } else {
      data = await parseCsv(
        `capabilities/default.csv`,
        rows =>
          // { '1': {...}, '2': {...} ...}
          rows.reduce((o, row) => {
            const hierarchy_id = getPath(row.hierarchy_id);
            return {
              ...o,
              [hierarchy_id]: {
                ...row,
                hierarchy_id,
                industry,
              },
            };
          }, {}),
        {
          renameHeaders: true,
          headers: ['hierarchy_id', 'name'],
        }
      );
    }
    root = await capabilityRepository.save({
      name: industry.name,
      industry,
      parent: null,
    });
    // Contain saved data by hierarchy_id key
    let groupByHierarchyId = {};
    // Convert to array
    let capabilities: any = Object.values(data);
    // Save capability one by one
    for (let capability of capabilities) {
      // 1.2.3.4.5 -> 1.2.3.4
      let parent = capability.hierarchy_id
        .split('.')
        .slice(0, -1)
        .join('.');
      groupByHierarchyId[capability.hierarchy_id] = await capabilityRepository.save({
        ...capability,
        parent: groupByHierarchyId[parent] || root,
      });
    }
  }
}

main();
