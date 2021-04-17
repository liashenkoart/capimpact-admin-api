import { createConnection, getManager } from 'typeorm';
import { parseCsv } from '@lib/parseCsv';
import { asyncForEach } from '@lib/sorting';
import { Ontology } from '../modules/ontologies/ontology.entity';
import { OntoTree, MetaProperties } from '../modules/ontotree/ontotree.entity';
import path from 'path';
import fs from 'fs';

let connection = null;

async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }

  const saved = {};
  await getManager().transaction(async transactionalEntityManager => {
    const fileName = process.argv[2];
    if(fileName) {
      const nameV = fileName + '-v.csv';
      const nameE = fileName + '-e.csv';
      let filePathToV = path.resolve(__dirname, '../../data', nameV);
      let filePathToE = path.resolve(__dirname, '../../data', nameE);
       if (fs.existsSync(filePathToE) && fs.existsSync(filePathToV)) {
        await Promise.all([await parseCsv(filePathToV),
                           await parseCsv(filePathToE)]).then(async ([nodes,edges]) => {
        const ontology = await transactionalEntityManager.save(Ontology, new Ontology({ name: fileName }));
                  
        await asyncForEach((nodes as any[]),async (row, index) => {
        const { id, name, uri: url } = row;
        const meta: MetaProperties = {url};
        const ontoTreeNode = new OntoTree({name,ontology, meta})
        if(index > 0) {
        const parentId = (edges as any[]).find((v) => v.src == id).dst;
        ontoTreeNode.parent = saved[parentId];
        }
        const savedOntology = await transactionalEntityManager.save(OntoTree, ontoTreeNode );
        saved[id] = savedOntology;
        });
        });
       } else {
         throw new Error('wrong file name was provided');
       }
    } else {
         throw new Error('No file name was provided');
    }
  });
}

main();
