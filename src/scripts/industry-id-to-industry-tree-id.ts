import { createConnection, getManager } from 'typeorm';

import { Industry, Company, IndustryTree, ValueDriver, Startup, Process } from '@modules/caps/entities';

import { asyncForEach } from '@lib/sorting';

let connection = null;

async function main() {
  connection = await createConnection();

  if (!connection.isConnected) {
    throw new Error('connection is not established');
  } 
 
  await getManager().transaction(async transactionalEntityManager => {
    const common = async (table,prop,entity) => {
      const list = await transactionalEntityManager.query(`SELECT * from ${table}`)
      await asyncForEach(list, async (comp) => {
        const industry = await transactionalEntityManager.findOne(Industry, { where: { id: comp.industry_id }});
        if(industry) {
            const industryTree = await transactionalEntityManager.findOne(IndustryTree, { where: { name: industry.name }});
            comp[prop] = industryTree.id;
            await transactionalEntityManager.save(entity, comp);
        }
       })
    }

    await common("companies","industry_id", Company);
    await common("value_drivers","industryId", ValueDriver);
    await common("startup","industry_tree_id", Startup);
    await common("processes","industry_id", Process);
   })
}

main();
