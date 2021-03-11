import { createConnection, getManager } from 'typeorm';

import { ValueDriver } from '../modules/value-driver/value-driver.entity';
import { Process } from '../modules/process/process.entity';
import { Company } from '../modules/company/company.entity';
import { Capability } from '../modules/capability/capability.entity';
import { IndustryTree } from '../modules/industry-tree/industry-tree.entity';
import { CapabilityTree } from '../modules/capability-tree/capability-tree.entity';
import { Startup} from '../modules/startup/startup.entity';
import { Industry } from '../modules/industry/industry.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
             console.log(capabilities)
             const capTreeIds = capabilities.map((i) => i.capabilityTreeId);
             const capTrees = await transactionalEntityManager.find(CapabilityTree, { where:  { id: In(capTreeIds)}})
            const startUp = await transactionalEntityManager.findOne(Startup, { where: { cid:comp.cid }});

           
        startUp.capability_tree = capTrees;

        const result =     await transactionalEntityManager.save(Startup, startUp);

                console.log('resu',capTrees)
          
        }
      
       })

   })
}

main();
