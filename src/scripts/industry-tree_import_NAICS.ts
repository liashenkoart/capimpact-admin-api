import { createConnection, getManager } from 'typeorm';
import { parseCsv } from '@lib/parseCsv';
import { IndustryTree } from "@modules/caps/entities";

let connection = null;

const getExamples = input => {
  input = input[0] === '[' && input[input.length-1] === ']' ? input.slice(1, input.length-2) : input;
  input = input[0] === `'` && input[input.length-1] === `'` ? input.slice(1, input.length-2) : input;
  return input.length ? input.split(`', '`) : null;
}

async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }
  console.time('buildingIndustryTree')
  const industries: any = await parseCsv('NAICS_files/naics2017-hier.csv', rows => rows.map(row => ({
    code: row.code,
    name: row.title,
    parent_id: row.parent_code,
  })));
  const sortedIndustries = industries.sort((a, b) => a.parent_id.localeCompare(b.parent_id, 'en', { numeric: true }));

  const rawDescriptions: any = await parseCsv('NAICS_files/2017_NAICS_Descriptions.csv', rows => rows);
  const description = {};
  rawDescriptions.forEach(d => {
    if (d.Description !== 'NULL')
    description[d.Code] = d.Description;
  });

  const rawExamples: any = await parseCsv('NAICS_files/naics2017-examples.csv', rows => rows);
  const examplesObj = {};
  rawExamples.forEach(({ code, examples }) => {
    const nodeExamples = getExamples(examples);
    if (nodeExamples) {
      examplesObj[code] = nodeExamples;
    }
  });

  await getManager().transaction(async transactionalEntityManager => {
    const nodes = [];
    for (let industry of sortedIndustries) {
      industry.description = description[industry.id] || '';
      if (examplesObj[industry.id]){
        industry.examples = examplesObj[industry.id];
      }
      if (industry.parent_id) {
        const parent = nodes.find(i => i.code === industry.parent_id);
        if (parent) {
          industry.parent = parent;
          industry.parent_id = parent.id;
        }
      } else {
        industry.parent_id = null;
      }
      nodes.push(await transactionalEntityManager.save(IndustryTree, new IndustryTree(industry)));
    }
  });
  console.timeEnd('buildingIndustryTree')
  console.log('import industry-tree is finished');
}

main();
