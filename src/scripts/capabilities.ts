import { createConnection, getManager } from 'typeorm';

import { Industry, Capability } from '@modules/caps/entities';

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

  await getManager().transaction(async transactionalEntityManager => {
    let industries: any = await parseCsv('industries.csv', rows =>
      rows.map((row: any) => ({
        ...row,
        id: +row.id,
      }))
    );
    for (let industry of industries) {
      const found = await transactionalEntityManager.findOne(Industry, {
        where: { name: industry.name },
      });
      if (!found) {
        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into('industries', ['id', 'name'])
          .values([industry])
          .execute();
      }
    }

    // get industries
    industries = await transactionalEntityManager.find(Industry);

    // clear all capabilities
    const resultDeleted = await transactionalEntityManager.delete(Capability, {});
    if (resultDeleted) {
      console.log(`Number of deleted records ${resultDeleted.affected}`);
    }

    // save tree capabilities for each industry
    for (let industry of industries) {
      // load capabilities for `industry`
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
      root = await transactionalEntityManager.save(Capability, {
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
        groupByHierarchyId[capability.hierarchy_id] = await transactionalEntityManager.save(
          Capability,
          {
            ...capability,
            parent: groupByHierarchyId[parent] || root,
          }
        );
      }
    }
  });
}

main();
