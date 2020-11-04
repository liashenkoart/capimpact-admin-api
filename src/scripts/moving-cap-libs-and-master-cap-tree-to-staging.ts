import { createConnection, getManager } from 'typeorm';
import { parseCsv } from '@lib/parseCsv';
import { omit } from 'lodash'
import { CapabilityLib } from '../modules/capability-libs/capability-lib.entity';
import { CapabilityTree } from '../modules/capability-tree/capability-tree.entity';
import { asyncForEach } from '@lib/sorting';
import { MasterCapabilityTree } from '@app/modules/capability-tree/master-capability-tree.entity';

let connection = null;

async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }
  
  const capLibsIds = {};
    
  await getManager().transaction(async transactionalEntityManager => {
     const cap_libs: any = await parseCsv('capability_lib.csv');

     await transactionalEntityManager.delete(CapabilityTree, 15019);
     await transactionalEntityManager.delete(CapabilityTree, 15018);
     await transactionalEntityManager.getRepository(CapabilityLib)
           .createQueryBuilder("cap_libs")
           .update()
           .set({ name: cap_libs[0].name, status: cap_libs[0].status ,description: cap_libs[0].description  })
           .where("id = :id",{ id: 1 })
           .execute();
           capLibsIds[1] = 1
           cap_libs.shift();
  
  await asyncForEach(cap_libs, async (lib) => {
        const newLib =  await transactionalEntityManager.save(CapabilityLib, new CapabilityLib(omit({...lib, tags: JSON.parse(lib.tags)},['id'])));
        capLibsIds[lib.id] = newLib.id;
  });

  let master_cap_tree: any = await parseCsv('master_cap_tree.csv', rows => rows.map(row => ({
    ...row,
    prevId: parseInt(row.prevId, 10),
    hierarchy_id: row.hierarchy_id ? parseInt(row.hierarchy_id, 10) : null,
    industry_tree_id: row.industry_tree_id ? parseInt(row.industry_tree_id, 10) : null,
    company_id: row.company_id ? parseInt(row.company_id, 10) : null,
    parentId: null,
    prevParentId: row.prevParentId ? parseInt(row.prevParentId, 10) : null,
    capability_lib_id: row.capability_lib_id ? parseInt(row.capability_lib_id, 10) : null,
    capability: null,
    tags: [],
    location: JSON.parse(row.location),
    technologies: JSON.parse(row.technologies)
  })));


  await asyncForEach(master_cap_tree, async (cap) => {
       await transactionalEntityManager.save(CapabilityTree, new CapabilityTree(cap));
  })
 

  // let cap_tree: any = await parseCsv('capdata.csv', rows => rows.map(row => ({
  //   ...row,
  //   prevId: parseInt(row.id, 10),
  //   hierarchy_id: row.hierarchy_id ? parseInt(row.hierarchy_id, 10) : null,
  //   industry_tree_id: row.industry_tree_id ? parseInt(row.industry_tree_id, 10) : null,
  //   company_id: row.company_id ? parseInt(row.company_id, 10) : null,
  //   parentId: null,
  //   prevParentId: row.parentId ? parseInt(row.parentId, 10) : null,
  //   capability_lib_id: row.capability_lib_id ? parseInt(row.capability_lib_id, 10) : null,
  //   capability: null,
  //   tags: [],
  //   location: JSON.parse(row.location),
  //   technologies: JSON.parse(row.technologies)
  // })));

  // let updateCapTree = cap_tree.filter((e, i) => {
  //   if(i === 0) return true;
  //   if(!e.prevParentId) return false;
  //   return cap_tree.findIndex((c) => c.id == e.prevParentId) !== -1;
  // });


  // await asyncForEach(updateCapTree, async (cap) => {
  //     if(cap.capability_lib_id) {
  //         cap.capability_lib_id = capLibsIds[cap.capability_lib_id]
  //     }
  //     await transactionalEntityManager.save(MasterCapabilityTree, new MasterCapabilityTree(cap));
  // })

  const list = await transactionalEntityManager.find(CapabilityTree,{ where: { type: 'master'}});

   await asyncForEach(list, async (cap) => {
    if(cap.prevParentId) {
     const parent = await transactionalEntityManager.findOne(CapabilityTree, { where: { prevId: cap.prevParentId }});
     cap.parent = parent; 
     await transactionalEntityManager.save(CapabilityTree, cap)
    }
  })

})
}

main();
