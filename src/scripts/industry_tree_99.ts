import { createConnection, getManager } from 'typeorm';
import { Industry, IndustryTree } from '@modules/caps/entities';

let connection = null;

async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }
  console.time('moving all industry to industry-tree with code 99')
  await getManager().transaction(async transactionalEntityManager => {
    let foundRoot = await transactionalEntityManager.findOne(IndustryTree, { where: { code: '99' } });

    if (!foundRoot) {
      foundRoot = await transactionalEntityManager.save(IndustryTree, new IndustryTree({
        name: 'Misc',
        code: '99',
      }));
    }

    const allIndustries = await transactionalEntityManager.find(Industry);
    const newIndustryTreeNodes = [];
    for (const industry of allIndustries) {
      const foundNode = await transactionalEntityManager.findOne(IndustryTree, { where: { name: industry.name } });
      if (!foundNode) {
        newIndustryTreeNodes.push(new IndustryTree({
          name: industry.name,
          parent: foundRoot,
        }));
      }
    }
    await transactionalEntityManager.save(IndustryTree, newIndustryTreeNodes);
  });
  console.timeEnd('moving all industry to industry-tree with code 99')
}

main();
