import { createConnection, getManager } from 'typeorm';

import { Process } from '../modules/process/process.entity';
import { Industry } from '../modules/industry/industry.entity';

import { parseCsv } from '@lib/parseCsv';
import { getPath } from '@lib/getPath';

let connection = null;

async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }
  let industries: any = [];
  let root = null;
  let data: any = [];
  let resultDeleted = null;

  const industryName = process.argv[2];

  await getManager().transaction(async transactionalEntityManager => {
    if (industryName) {
      industries = await transactionalEntityManager.find(Industry, {
        where: { name: industryName },
      });
    } else {
      industries = await parseCsv('industries.csv', rows =>
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
      industries = await transactionalEntityManager.find(Industry);
    }

    if (!industryName) {
      // clear all processes
      resultDeleted = await transactionalEntityManager.delete(Process, {});
      if (resultDeleted) {
        console.log(`Process: Number of deleted records ${resultDeleted.affected}`);
      }
    }

    // save tree processes for each industry
    for (let industry of industries) {
      // Get csv data
      data = await parseCsv(
        `processes/${industry.name}.csv`,
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
      // save root industry node
      root = await transactionalEntityManager.save(Process, {
        name: industry.name,
        industry,
        parent: null,
      });
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
        groupByHierarchyId[proc.hierarchy_id] = await transactionalEntityManager.save(Process, {
          ...proc,
          parent: groupByHierarchyId[parent] || root,
        });
      }
    }
  });
}

main();
