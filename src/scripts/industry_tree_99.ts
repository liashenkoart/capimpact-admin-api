import { createConnection, getManager } from 'typeorm';
import { Industry, IndustryTree, Capability, CapabilityTree } from '@modules/caps/entities';

let connection = null;

async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }
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
      const node = await transactionalEntityManager.findOne(IndustryTree, { where: { name: industry.name } });
      const industryTree = new IndustryTree({ id: node?.id, name: industry.name, parent: foundRoot });

      const capTreesForIndustryTree = [];
      const rootCap = await transactionalEntityManager.findOne(Capability, {
        where: { industry_id: industry.id, parentId: null },
      });

      if (rootCap) {
        const treeOfCap = await transactionalEntityManager.getTreeRepository(Capability).findDescendantsTree(rootCap);
        const createCapTreeNode = async (cap, parent) => {
          const capTreeNode = await transactionalEntityManager.save(CapabilityTree, new CapabilityTree({
            name: cap.name,
            capability: cap,
            parent,
          }));
          await transactionalEntityManager.save(Capability, new Capability({
            id: cap.id,
            capability_tree: capTreeNode,
          }));
          capTreesForIndustryTree.push(capTreeNode);
          for (const child of cap.children) {
            await createCapTreeNode(child, capTreeNode);
          }
        };
        await createCapTreeNode(treeOfCap, null);
        industryTree.capability_trees = capTreesForIndustryTree;
        newIndustryTreeNodes.push(industryTree);
      }
    }
    await transactionalEntityManager.save(IndustryTree, newIndustryTreeNodes);
  });
}

main();
