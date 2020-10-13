import { createConnection, getManager } from 'typeorm';

import { ValueDriver } from '../modules/value-driver/value-driver.entity';
import { Startup } from '../modules/startup/startup.entity';
import { Process } from '../modules/process/process.entity';
import { Company } from '../modules/company/company.entity';
import { IndustryTree } from '../modules/industry-tree/industry-tree.entity';
import { CapabilityTree } from '../modules/capability-tree/capability-tree.entity';

import { Industry } from '../modules/industry/industry.entity';
import { Capability } from '../modules/capability/capability.entity';

import { asyncForEach } from '@lib/sorting';
import { each } from 'lodash';

const masterTreeTemplate = { cap_name: 'Master CapTree', type: 'master', parentId: null };

let connection = null;

async function main() {
  connection = await createConnection();

  if (!connection.isConnected) {
    throw new Error('connection is not established');
  } 
 
  await getManager().transaction(async transactionalEntityManager => {
    const node = await transactionalEntityManager.findOne(CapabilityTree, masterTreeTemplate);

    const tree = await transactionalEntityManager.getTreeRepository(CapabilityTree).findDescendantsTree(node)

    let array = [];
  
    const recursiveFunction = function (collection){ 
         let count = 0;
        each(collection, (model) => {  
           model.hierarchy_id = count++;
            console.log(model);
            array.push(model)
            if(model.children.length > 0){ 
                recursiveFunction(model.children); 
            }
        }); 
      };

      recursiveFunction(tree.children)

      await asyncForEach(array, async (comp) => {
        const entity = await transactionalEntityManager.findOne(CapabilityTree, { where: { id: comp.id }});
        entity.hierarchy_id = Number(comp.hierarchy_id);
        await transactionalEntityManager.save(entity);
      })
    
})
}

main();