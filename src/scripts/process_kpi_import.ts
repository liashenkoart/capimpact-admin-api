import { createConnection, getManager } from 'typeorm';
import { parseCsv } from '@lib/parseCsv';
import { Process } from '../modules/process/process.entity';
import { KpiLib } from '../modules/kpi-lib/kpi-lib.entity';
import { IndustryTree } from '../modules/industry-tree/industry-tree.entity';

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
    let foundIndustry = await transactionalEntityManager.findOne(IndustryTree, { where: { name: 'BizCase' } });

    if (!foundIndustry) {
      foundIndustry = await transactionalEntityManager.save(IndustryTree, new IndustryTree({ name: 'BizCase' }));
    }

    let rootProcess = await transactionalEntityManager.findOne(Process, { where: { name: 'BizCase' } });
    if (rootProcess) {
      const options = { where: { parentId: rootProcess.id }, relations: ['kpi_libs'] };
      const processes = await transactionalEntityManager.find(Process, options);
      for (const { kpi_libs } of processes) {
        const updatedKpiLibs = kpi_libs.map(kpi => ({ ...kpi, process: null }));
        await transactionalEntityManager.save(KpiLib, updatedKpiLibs);
      }
      await transactionalEntityManager.delete(Process,{ parentId: rootProcess.id });
      await transactionalEntityManager.delete(Process,{ id: rootProcess.id });
      rootProcess = null;
    }
    if (!rootProcess) {
      rootProcess = await transactionalEntityManager.save(Process, new Process({
        name: 'BizCase',
        industry: foundIndustry,
      }));
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
        parent: rootProcess,
      }))
      newProcessIds.push(newProcess.id);
    }
  });
  console.timeEnd('import_processes_and_kpi_libs')
  console.log('newProcessIds => ', newProcessIds);
}

main();
