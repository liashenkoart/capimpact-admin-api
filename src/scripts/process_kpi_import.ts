import { createConnection, getManager } from 'typeorm';
import { parseCsv } from '@lib/parseCsv';
import { Industry, Process, KpiLib } from '@modules/caps/entities';

let connection = null;

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

  const processesData = [];
  const kpiData = {};
  fileData.forEach(i => {
    if (!processesData.includes(i.process)) {
      processesData.push(i.process);
    }
    if (!kpiData[i.process]) {
      kpiData[i.process] = [];
    }
    kpiData[i.process].push({ label: i.kpi, description: i.kpiDescription });
  });

  const newProcessIds = [];
  await getManager().transaction(async transactionalEntityManager => {
    let foundIndustry = await transactionalEntityManager.findOne(Industry, { where: { name: 'BizCase' } });

    if (!foundIndustry) {
      foundIndustry = await transactionalEntityManager.save(Industry, new Industry({ name: 'BizCase' }))
    }

    for (const processName of processesData) {
      const kpiLibs = [];
      for (const { label, description } of kpiData[processName]) {
        let kpiLib = await transactionalEntityManager.findOne(KpiLib, { where: { label } });
        if (!kpiLib) {
          kpiLib = await transactionalEntityManager.save(KpiLib, new KpiLib({ label, description }));
        }
        kpiLibs.push(kpiLib);
      }
      const newProcess = await transactionalEntityManager.save(Process, new Process({
        name: processName,
        kpi_libs: kpiLibs,
        industry: foundIndustry,
      }))
      newProcessIds.push(newProcess.id);
    }
  });
  console.timeEnd('import_processes_and_kpi_libs')
  console.log('newProcessIds => ', newProcessIds);
}

main();
