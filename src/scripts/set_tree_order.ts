import { createConnection, getManager } from 'typeorm';

import { Industry, Company, IndustryTree, ValueDriver, Startup, Process, CapabilityTree } from '@modules/caps/entities';

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