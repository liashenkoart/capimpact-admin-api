import { createConnection, getManager } from 'typeorm';
import { asyncForEach, flattenTree } from '@lib/sorting';
import { CapabilityTree } from '../modules/capability-tree/capability-tree.entity'
import { OntoTree } from '../modules/ontotree/ontotree.entity';
import { CapabilityLib } from '../modules/capability-libs/capability-lib.entity';

let connection = null;

async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }

  await getManager().transaction(async transactionalEntityManager => {

      const ontologyId = process.argv[2];
      const oldCapToNewCapIDs = {}
      const root = await transactionalEntityManager.findOne(OntoTree,{ where: { ontology: { id: ontologyId }, parentId: null }, relations: ['ontology']});
  
      if(!root) {
        throw new Error('Ontology not found');
      }

      const clonedTree = await transactionalEntityManager.getTreeRepository(OntoTree).findDescendantsTree(root);

     await  asyncForEach(flattenTree(clonedTree, 'children'), async ({id , name, parentId },index) => {
        const capLibExist = await transactionalEntityManager.findOne(CapabilityLib,{ where: { name } });
        name = capLibExist ? `${name}_duplicated_${Math.floor(Math.random() * 9999)}` : name; 
        const capTree = new CapabilityTree({ cap_name: name, type: 'master'});
              capTree.capability_lib = await transactionalEntityManager.save(CapabilityLib,new CapabilityLib({name}));
        if(index === 0) {
          capTree.parent = await transactionalEntityManager.findOne(CapabilityTree,{ where: {parentId: null, type: 'master'}});  
        } else {
          capTree.parent = await transactionalEntityManager.findOne(CapabilityTree,{ where: { id: oldCapToNewCapIDs[parentId], type: 'master' }});  
        }

        const masterNode = await transactionalEntityManager.save(CapabilityTree,capTree);
        oldCapToNewCapIDs[id] = masterNode.id;
      })
  
  });
}

main();
