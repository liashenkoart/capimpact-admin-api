import { createConnection, getManager } from 'typeorm';

import { Industry, Company, IndustryTree, ValueDriver, Startup, Process } from '@modules/caps/entities';

import { parseCsv } from '@lib/parseCsv';

import { sortTreeByField, flattenTree, asyncForEach } from '@lib/sorting';

let connection = null;

async function main() {
  connection = await createConnection();

  console.log("here")
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  } 
 
  await getManager().transaction(async transactionalEntityManager => {

    const prom = new Promise((res, rej) => {
      connection.query('SELECT * from companies', function (error,results,fields) {
        if (error) throw error;
        results = results.map((result) => {
           return Object.assign({}, result);
      });
        console.log(results);
        res(results);
      });
    });
   

    const companies = await transactionalEntityManager.query('SELECT * from companies')

    await asyncForEach(companies, async (comp) => {
      const industry = await transactionalEntityManager.findOne(Industry, { where: { id: comp.industry_id }});
     
      if(industry) {
       const industryTree = await transactionalEntityManager.findOne(IndustryTree, { where: { name: industry.name }});
      comp.industry_id = industryTree.id;
      await transactionalEntityManager.save(Company, comp);
      }
  

  });

//   const drivers = await transactionalEntityManager.query('SELECT * from value_drivers')

//   await asyncForEach(drivers, async (comp) => {
//     const industry = await transactionalEntityManager.findOne(Industry, { where: { id: comp.industry_id }});
   
//     if(industry) {
//      const industryTree = await transactionalEntityManager.findOne(IndustryTree, { where: { name: industry.name }});
//      comp.industryId = industryTree.id;
//      await transactionalEntityManager.save(ValueDriver, comp);
//     }
// });


// const startups = await transactionalEntityManager.query('SELECT * from startup')

// await asyncForEach(startups, async (comp) => {
//   const industry = await transactionalEntityManager.findOne(Industry, { where: { id: comp.industry_id }});
 
//   if(industry) {
//    const industryTree = await transactionalEntityManager.findOne(IndustryTree, { where: { name: industry.name }});
//    comp.industry_tree_id = industryTree.id;
//    await transactionalEntityManager.save(Startup, comp);
//   }
// });

// const processes = await transactionalEntityManager.query('SELECT * from processes')

// await asyncForEach(processes, async (comp) => {
//   const industry = await transactionalEntityManager.findOne(Industry, { where: { id: comp.industry_id }});
 
//   if(industry) {
//    const industryTree = await transactionalEntityManager.findOne(IndustryTree, { where: { name: industry.name }});
//    comp.industry_id = industryTree.id;
//    await transactionalEntityManager.save(Process, comp);
//   }
// });

   })
 
   
    
    
}

main();
