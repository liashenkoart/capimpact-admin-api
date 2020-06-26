import { createConnection, getManager } from 'typeorm';
import { parseCsv } from '@lib/parseCsv';
import { Industry, Process, KpiLib } from '@modules/caps/entities';

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
  console.time('import_processes_and_kpi_libs')
  const fileData: any = await parseCsv('KPIstoProcess-BizCaseMVP1.csv', rows => rows.map(row => ({
    process: row.Process,
    kpi: row.KPI,
    kpiDescription: row['KPI Description'],
  })));

  console.log('fileData => ', fileData);

  //const sortedIndustries = industries.sort((a, b) => a.parentId.localeCompare(b.parentId, 'en', { numeric: true }));

  await getManager().transaction(async transactionalEntityManager => {

    const foundIndustry = await transactionalEntityManager.findOne(Industry, {
      where: { name: 'BizCase' },
    });

    console.log('foundIndustry => ', foundIndustry);

    // const nodes = [];
    // for (let industry of sortedIndustries) {
    //   industry.description = description[industry.id] || '';
    //   if (examplesObj[industry.id]){
    //     industry.examples = examplesObj[industry.id];
    //   }
    //   if (industry.parentId) {
    //     const parent = nodes.find(i => i.code === industry.parentId);
    //     if (parent) {
    //       industry.parent = parent;
    //       industry.parentId = parent.id;
    //     }
    //   } else {
    //     industry.parentId = null;
    //   }
    //   nodes.push(await transactionalEntityManager.save(IndustryTree, new IndustryTree(industry)));
    // }
  });
  console.timeEnd('import_processes_and_kpi_libs')
  console.log('import is finished');
}

main();
