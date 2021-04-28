import { createConnection, getManager } from 'typeorm';

import { IndustryTree } from '../modules/industry-tree/industry-tree.entity';
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

    const roots = await transactionalEntityManager.find(CapabilityTree,{ where: { parentId: null, type: 'industry'}});

    await asyncForEach(roots,async (node) => {
          if(node.industry_tree_id) {
            const industry = await transactionalEntityManager.findOne(IndustryTree,node.industry_tree_id);
            node.cap_name = industry.name;
            await transactionalEntityManager.save(CapabilityTree,node);
          }
    })
   })
}

main();
