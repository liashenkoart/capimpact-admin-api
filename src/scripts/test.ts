import { createConnection, getManager } from 'typeorm';

import { Capability } from '../modules/capability/capability.entity';
import { CapabilityTree } from '../modules/capability-tree/capability-tree.entity';
import { Startup} from '../modules/startup/startup.entity';
import { In } from 'typeorm';
import { asyncForEach } from '@lib/sorting';

let connection = null;

async function main() {
  connection = await createConnection();

  if (!connection.isConnected) {
    throw new Error('connection is not established');
  } 
 
  await getManager().transaction(async transactionalEntityManager => {

    const startUps = await transactionalEntityManager.find(Startup);

      await asyncForEach(startUps, async (comp) => {
         const list = await transactionalEntityManager.query(`SELECT * from startup_capabilities_capabilities where cid = '${comp.cid}'`)

         if (list.length > 0) { 
             const capsIds = list.map((i) => i.capabilitiesId);
             const capabilities = await transactionalEntityManager.find(Capability, { where:  { id: In(capsIds)}});

             const capTreeIds = capabilities.filter((u) => u.capabilityTreeId).map((i) => i.capabilityTreeId);

             const capTrees = await transactionalEntityManager.find(CapabilityTree, { where:  { id: In(capTreeIds)}})
             const startUp = await transactionalEntityManager.findOne(Startup, { where: { cid:comp.cid }});

                   startUp.capabilities = capTrees; 

          await transactionalEntityManager.save(Startup, startUp);
        }
       })

   })
}

main();
