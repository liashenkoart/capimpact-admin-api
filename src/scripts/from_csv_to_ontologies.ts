import { createConnection, getManager } from 'typeorm';
import { parseCsv } from '@lib/parseCsv';
import { asyncForEach } from '@lib/sorting';
import { Ontology } from '../modules/ontologies/ontology.entity';
import { OntoTree } from '../modules/ontotree/ontotree.entity';
let connection = null;

async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }
  const saved = {};
  await getManager().transaction(async transactionalEntityManager => {
   await Promise.all([await parseCsv('FinancialServicesOntology-v.csv'),
                      await parseCsv('FinancialServicesOntology-e.csv')]).then(async ([nodes,edges]) => {
  const ontology = await transactionalEntityManager.save(Ontology, new Ontology({ name: 'FinancialServicesOntology' }));
                        
    await asyncForEach((nodes as any[]),async (row, index) => {
    const { id, name } = row;
    const ontoTreeNode = new OntoTree({name,ontology})
    if(index > 0) {
      const parentId = (edges as any[]).find((v) => v.src == id).dst;
      ontoTreeNode.parent = saved[parentId];
    }
    const savedOntology = await transactionalEntityManager.save(OntoTree, ontoTreeNode );
    saved[id] = savedOntology;
    });
    });
  });
}

main();
