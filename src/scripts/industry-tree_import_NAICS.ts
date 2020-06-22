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
    id: parseInt(row.code, 10),
    naicsCode: parseInt(row.code, 10),
    name: row.title,
    parentId: row.parent_code ? parseInt(row.parent_code, 10) : null,
  })));
  const sortedIndustries = industries.sort((a, b) => (a.parentId || 0) - (b.parentId || 0));

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
      if (industry.parentId) {
        const parent = nodes.find(i => i.naicsCode === industry.parentId);
        if (parent) {
          industry.parent = parent;
        }
      }
      nodes.push(await transactionalEntityManager.save(IndustryTree, new IndustryTree(industry)));
    }
  });
  console.timeEnd('buildingIndustryTree')
  console.log('import industry-tree is finished');
}

main();
