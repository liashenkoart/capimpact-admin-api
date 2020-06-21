import { createConnection, getManager } from 'typeorm';
import { parseCsv } from '@lib/parseCsv';
import { IndustryTree } from "@modules/caps/entities";

let connection = null;

async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }
  console.time('buildingIndustryTree')
  await getManager().transaction(async transactionalEntityManager => {
    const industries: any = await parseCsv('NAICS_files/naics2017-hier.csv', rows => rows.map(row => ({
      id: parseInt(row.code, 10),
      name: row.title,
      parentId: row.parent_code ? parseInt(row.parent_code, 10) : null,
    })));
    const sortedIndustries = industries.sort((a, b) => (a.parentId || 0) - (b.parentId || 0));

    const rawDescriptions: any = await parseCsv('NAICS_files/2017_NAICS_Descriptions.csv', rows => rows);
    const description = {};
    rawDescriptions.forEach(d => {
      description[d.Code] = d.Description;
    });

    const rawExamples: any = await parseCsv('NAICS_files/naics2017-examples.csv', rows => rows);
    const examples = {};
    rawExamples.forEach(ex => {
      const length = ex.examples.length;
      const str = ex.examples[0] === '[' && ex.examples[length-1] === ']'
        ? ex.examples.slice(1, length-2)
        : ex.examples;
      if (str.length) {
        examples[ex.code] = str;
      }
    });

    for (let industry of sortedIndustries) {
      if (industry.parentId) {
        industry.parent = await transactionalEntityManager.findOne(IndustryTree, {
          where: { id: industry.parentId },
        });
      }
      industry.description = description[industry.id] || '';
      industry.examples = examples[industry.id] || '';

      await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into('industry_tree', ['id', 'name', 'parentId', 'parent', 'description', 'examples'])
        .values([industry])
        .execute();
    }
  });
  console.timeEnd('buildingIndustryTree')
  console.log('import industry-tree is finished');
}

main();
