import { createConnection, getManager } from 'typeorm';
import { parseCsv } from '@lib/parseCsv';
import { asyncForEach } from '@lib/sorting';
import { CapabilityLib } from '../modules/capability-libs/capability-lib.entity';
import { CapabilityTree } from '../modules/capability-tree/capability-tree.entity';

import path from 'path';
import fs from 'fs';

let connection = null;

async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }

  await getManager().transaction(async transactionalEntityManager => {
      const nameV = 'copy_of_new_capabilities.csv';
      let filePathToV = path.resolve(__dirname, '../../data', nameV);
      const result = [];
      const masterRoot = await await transactionalEntityManager.findOne(CapabilityTree,{ where: { type: 'master', parentId: null}});
        await parseCsv(filePathToV).then(async (data) => {
        await asyncForEach((data as any[]),async (row, index) => {
          const libName = row['Oil And Natural Gas Properties'];
          const existsLib = await transactionalEntityManager.findOne(CapabilityLib,{ where: { name: libName  }});
          if(existsLib) {
            result.push({ id: existsLib.id, name: libName, status: 'exists'});
          } else {
            const newLib = await transactionalEntityManager.save(CapabilityLib,new CapabilityLib({ name: libName }));
            const capNodeEntity = new CapabilityTree({ cap_name: newLib.name, parent: masterRoot, capability_lib_id: newLib.id, type: 'master'});
            const newCapNodeEntity = await transactionalEntityManager.save(CapabilityTree,capNodeEntity);
            result.push({ id: newLib.id, name: libName, status: 'new'})
        }
        });
        console.dir(result, {'maxArrayLength': null})
  });
})
}

main();
