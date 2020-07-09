import { createConnection, getManager } from 'typeorm';
import _ from 'lodash';
import { Industry, IndustryTree, Capability, CapabilityTree, Company } from '@modules/caps/entities';

let connection = null;

async function main() {
  connection = await createConnection();
  if (!connection.isConnected) {
    throw new Error('connection is not established');
  }
  await getManager().transaction(async transactionalEntityManager => {
    let newCapCount = 0;
    const createCapTreeNode = async (cap, parent, capTreeArray = []) => {
      const capTreeNode = await transactionalEntityManager.save(CapabilityTree, new CapabilityTree({
        cap_name: cap.name,
        capability: cap,
        parent,
      }));
      await transactionalEntityManager.save(Capability, new Capability({
        id: cap.id,
        capability_tree: capTreeNode,
      }));
      capTreeArray.push(capTreeNode);
      newCapCount++;
      if (newCapCount % 1000 === 0) {
        console.log('capability-trees were added: ', newCapCount);
      }
      for (const child of cap.children) {
        await createCapTreeNode(child, capTreeNode, capTreeArray);
      }
    };

    console.log('start => cap-trees with industry');
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

      const rootCap = await transactionalEntityManager.findOne(Capability, {
        where: { industry_id: industry.id, parentId: null },
      });

      if (rootCap) {
        const capTreesForIndustryTree = [];
        const treeOfCap = await transactionalEntityManager.getTreeRepository(Capability).findDescendantsTree(rootCap);
        await createCapTreeNode(treeOfCap, null, capTreesForIndustryTree);
        industryTree.capability_trees = capTreesForIndustryTree;
        newIndustryTreeNodes.push(industryTree);
      }
    }
    await transactionalEntityManager.save(IndustryTree, newIndustryTreeNodes);

    console.log('finish => cap-trees with industry... total cap-trees were added: ', newCapCount);
    newCapCount = 0;
    console.log('start => cap-trees with company');
    let companiesToUpdate = [];
    const rootCaps = await transactionalEntityManager.find(Capability, {
      where: { industry_id: null, parentId: null },
    });
    for (const rootCap of rootCaps) {
      if (!rootCap.company_id){
        continue;
      }
      const capTreesForCompany = [];
      const treeOfCap = await transactionalEntityManager.getTreeRepository(Capability).findDescendantsTree(rootCap);
      await createCapTreeNode(treeOfCap, null, capTreesForCompany);
      let company = companiesToUpdate.find(({ id }) => id === rootCap.company_id);
      company = company || await transactionalEntityManager.findOne(Company, {
        where: { id: rootCap.company_id }
      });
      const { capability_trees = [] } = company;
      company.capability_trees = _.uniq([...capability_trees, ...capTreesForCompany]);
      companiesToUpdate = [
        ...companiesToUpdate.filter(i => i.id !== company.id),
        company,
      ];
    }
    await transactionalEntityManager.save(Company, companiesToUpdate);
    console.log('finish => cap-trees with company... total cap-trees were added: ', newCapCount);
    newCapCount = 0;
    console.log('start => cap-trees without industry & company');

    const rootCapsWithNothing = await transactionalEntityManager.find(Capability, {
      where: { industry_id: null, company_id: null, parentId: null },
    });
    for (const rootCap of rootCapsWithNothing) {
      const treeOfCap = await transactionalEntityManager.getTreeRepository(Capability).findDescendantsTree(rootCap);
      await createCapTreeNode(treeOfCap, null);
    }
    console.log('finish => cap-trees without industry & company... total cap-trees were added: ', newCapCount);
  });
}

main();
