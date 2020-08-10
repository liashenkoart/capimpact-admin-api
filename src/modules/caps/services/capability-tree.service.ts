import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { flattenTree } from '@lib/sorting';
import { BaseService } from '@modules/common/services';
import { CapabilityTree, CapabilityLib, IndustryTree } from '../entities';
import { CapabilityTreesArgs, CapabilityTreeCreationInput, CapabilityTreeInput } from '../dto';

// const masterTreeTemplate = { type: 'master'};
const masterTreeTemplate = { cap_name: 'Master CapTree', type: 'master', parentId: null };

@Injectable()
export class CapabilityTreeService extends BaseService {
  constructor(
    @InjectRepository(CapabilityLib) private readonly capabilityLibRepository: Repository<CapabilityLib>,
    @InjectRepository(IndustryTree) private readonly industryTreeRepository: Repository<IndustryTree>,
    @InjectRepository(CapabilityTree) private readonly capabilityTreeRepository: Repository<CapabilityTree>,
    @InjectRepository(CapabilityTree) private readonly treeRepository: TreeRepository<CapabilityTree>
  ) {
    super();
  }

  async findAll(query: CapabilityTreesArgs): Promise<CapabilityTree[] | void> {
    return this.capabilityTreeRepository.find(this.getFindAllQuery(query));
  }

  async findOneById(id: number): Promise<CapabilityTree> {
    return this.capabilityTreeRepository.findOne({ id });
  }

  async fillTree(node): Promise<Object> {
    node.capability_lib = await this.capabilityLibRepository.findOne({ id: node.capability_lib_id });
    console.log("CapabilityTreeService -> node", node)

    node.children = await Promise.all(node.children.map(child => this.fillTree(child)));
    return node;
  }

  // This is for getting caps that have status set to active
  async filterActiveTree(node): Promise<Object> {
    if (node.children.length !== 0) {
      node.children = node.children.filter(child => child.status === 'active' && child.show)
      node.children.map(child => this.filterActiveTree(child))
    }
    return node;
  }

  async findMasterCapTree(): Promise<Object> {
    // const MasterCapTree = await this.capabilityTreeRepository.find({where: masterTreeTemplate});
    // console.log("CapabilityTreeService -> MasterCapTree", MasterCapTree)
    // // return MasterCapTree
    // let root = await this.capabilityTreeRepository.find({where: masterTreeTemplate});
    // if (!root) {
    //   root = await this.createMasterCapTree();
    // }
    // const tree = await this.treeRepository.findDescendantsTree(root);
    // return await this.fillTree(tree);

    let root = await this.capabilityTreeRepository.findOne(masterTreeTemplate);
    if (!root) {
      root = await this.createMasterCapTree();
    }
    const tree = await this.treeRepository.findDescendantsTree(root);

    // return await this.fillTree(tree);
    return await this.filterActiveTree(tree);

  }

  async createMasterCapTree(): Promise<CapabilityTree> {
    const capLibs = await this.capabilityLibRepository.find({ capability_trees: null });
    const masterTree = await this.capabilityTreeRepository.save(new CapabilityTree(masterTreeTemplate));
    await Promise.all(capLibs.map(async capability_lib => {
      const firstLevelChild = await this.capabilityTreeRepository.save(new CapabilityTree({
        parent: masterTree,
        type: masterTree.type,
        cap_name: capability_lib.name,
        capability_lib,
      }));
    }));
    return masterTree;
  }

  async create(data: CapabilityTreeCreationInput): Promise<CapabilityTree> {
    if (data.type === 'master' && !data.parentId) {
      const MasterCapLib = await this.capabilityTreeRepository.findOne(masterTreeTemplate);
      data.parentId = MasterCapLib.id
    }
    const capabilityTree = await this.collectEntityFields(new CapabilityTree(data));

    return await this.capabilityTreeRepository.save(capabilityTree);
  }

  async save(id: number, data: CapabilityTreeInput): Promise<CapabilityTree> {
    data.id = id
    const cap = await this.capabilityTreeRepository.findOne(id);

    const masterCap = await this.capabilityTreeRepository.findOne(masterTreeTemplate);
    if(data.status !== cap.status){
      data.parentId = masterCap.id
    }

    if (data.status === 'inactive') {
      const childrenOfcap = await this.capabilityTreeRepository.find({ where: { parentId: id } });

      childrenOfcap.forEach(async child => {
        child.parentId = cap.parentId
        await this.capabilityTreeRepository.save(child);
      })
    }

    const capabilityTree = await this.collectEntityFields(new CapabilityTree(data));
    return this.capabilityTreeRepository.save(capabilityTree);
  }

  async delete_many(capIds: number[]) {
    const node = await this.capabilityTreeRepository.findOne(capIds[0])
    await this.capabilityTreeRepository.delete(capIds);
    console.log("CapabilityTreeService -> delete_many -> capIds", capIds)
    console.log("CapabilityTreeService -> delete_many -> node", node)
    return node;
  }

  async remove_from_captree(id: number) {
    const node = await this.capabilityTreeRepository.findOne(id)
    await this.capabilityTreeRepository.delete({ capability_lib_id: id });
    console.log("CapabilityTreeService -> delete_many -> id", id)
    console.log("CapabilityTreeService -> delete_many -> node", node)
    return node;
  }

  async remove(id: number) {
    const node = await this.capabilityTreeRepository.findOne({ id });
    let allRelatedIds = [];
    if (node) {
      const tree = await this.treeRepository.findDescendantsTree(node);
      allRelatedIds = (tree ? flattenTree(tree, 'children') : []).map(({ id }) => id);
      const foundChildren = await this.capabilityTreeRepository.findByIds(allRelatedIds);
      await Promise.all(foundChildren.map(async capTreeNode => {
        const options = { where: { id: capTreeNode.capability_lib_id }, relations: ['capability_trees'] };
        const capLib = await this.capabilityLibRepository.findOne(options);
        if (!capLib) {
          return;
        }
        capLib.capability_trees = capLib.capability_trees.filter(item => item.id !== capTreeNode.id);
        const filteredCapLib = await this.capabilityLibRepository.save(capLib);
        if (!filteredCapLib.capability_trees.length) {
          // await this.capabilityLibRepository.remove(filteredCapLib);
        }
      }));
      await this.capabilityTreeRepository.remove(foundChildren);
    }
    return { ids: allRelatedIds };
  }

  async tree(query: CapabilityTreesArgs): Promise<CapabilityTree> {
    const root = await this.capabilityTreeRepository.findOne({ parentId: null });
    if (!root) {
      throw new NotFoundException();
    }
    return this.treeRepository.findDescendantsTree(root);
  }

  async collectEntityFields(capabilityTree: CapabilityTree): Promise<CapabilityTree> {
    if (capabilityTree.parentId) {
      capabilityTree.parent = await this.findOneById(capabilityTree.parentId);
    }
    if (capabilityTree.capability_lib_id) {
      capabilityTree.capability_lib = await this.capabilityLibRepository.findOne({
        id: capabilityTree.capability_lib_id
      });
    }
    if (capabilityTree.industry_tree_id) {
      capabilityTree.industry_tree = await this.industryTreeRepository.findOne({
        id: capabilityTree.industry_tree_id
      });
    }
    return capabilityTree;
  }

  async unselectCapTree(id: number) {
    const cap = await this.capabilityTreeRepository.findOne(id);

    const capChildren = await this.capabilityTreeRepository.find({ where: { parentId: cap.id } });
    capChildren.forEach(async child => {
      child.parentId = cap.parentId
      await this.capabilityTreeRepository.save(child);
    })

    return this.remove(id);
  }
}
