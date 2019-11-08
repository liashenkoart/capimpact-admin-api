import { createConnection, getRepository, getTreeRepository, TreeRepository } from 'typeorm';
import _ from 'lodash';

import { Industry } from '@modules/industries/industry.entity';
import { DefaultProcess } from '@modules/processes/default-process.entity';
import { Process } from '@modules/processes/process.entity';

import { parseCsv } from '@lib/parseCsv';
import { getPath } from '@lib/getPath';

let connection = null;

async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }

  const industryRepository = getRepository(Industry);
  const defaultProcessRepository = getRepository(DefaultProcess);
  const processRepository = getRepository(Process);

  // save industries
  let industries: any = await parseCsv('industries.csv', rows =>
    rows.map(row => ({
      ...row,
      id: parseInt(row.id, 10),
    }))
  );
  industries = await industryRepository.save(industries);

  // save tree processes for each industry
  for (let industry of industries) {
    // save root industry node
    let root = await defaultProcessRepository.save({
      name: industry.name,
      industry,
      parent: null,
    });
    await processRepository.save(root);
    let data: any = await parseCsv(
      `${industry.name}.csv`,
      rows =>
        // { '1': {...}, '2': {...} ...}
        rows.reduce((o, row) => {
          const hierarchy_id = getPath(row.hierarchy_id);
          return {
            ...o,
            [hierarchy_id]: {
              ...row,
              metrics_avail: row.metrics_avail === 'Y',
              hierarchy_id,
              industry,
            },
          };
        }, {}),
      {
        renameHeaders: true,
        headers: [
          'pcf_id',
          'hierarchy_id',
          'name',
          'difference_idx',
          'change_details',
          'metrics_avail',
        ],
      }
    );
    // Contain saved data by hierarchy_id key
    let groupByHierarchyId = {};
    // Convert to array
    let processes: any = Object.values(data);
    // Save process one by one
    for (let proc of processes) {
      // 1.2.3.4.5 -> 1.2.3.4
      let parent = proc.hierarchy_id
        .split('.')
        .slice(0, -1)
        .join('.');
      groupByHierarchyId[proc.hierarchy_id] = await defaultProcessRepository.save({
        ...proc,
        parent: groupByHierarchyId[parent] || root,
      });
      await processRepository.save(groupByHierarchyId[proc.hierarchy_id]);
    }
  }

  /*
  const processes = await defaultProcessRepository.find();
  await processRepository.save(processes);
  */

  /*
  // Test tree
  const treeRepository = getTreeRepository(Process);
  const trees = await treeRepository.findTrees();
  console.log(trees);
  */
}

main();
