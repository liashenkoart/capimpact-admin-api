import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, Not, getManager, IsNull, EntityManager } from 'typeorm';
import { sortTreeByField, flattenTree, asyncForEach } from '@lib/sorting';
import { BaseService } from '@modules/common/services';
import { CapabilityTree, CapabilityLib, IndustryTree, Capability, KpiLib } from '../entities';
import { CapabilityTreesArgs, CapabilityTreeCreationInput, CapabilityTreeInput, CapabilitiesArgs } from '../dto';
import { CapabilityTreeIndustryCreationInput } from '../dto/capability-tree-industry-creation.dto';
import { CapabilityTreeMasterCreationInput } from '../dto/capability-tree-master-creation.dto';

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
    // For some reason true or false comes as string
    if (query.onlyCapLibs === 'true') {
      return this.capabilityTreeRepository.find({ where: { capability_lib_id: Not(IsNull()) } });
    }

    return this.capabilityTreeRepository.find(this.getFindAllQuery(query));
  }

  async findOneById(id: number): Promise<CapabilityTree> {
    return this.capabilityTreeRepository.findOne({ id });
  }

  async fillTree(node): Promise<Object> {
    node.capability_lib = await this.capabilityLibRepository.findOne({ id: node.capability_lib_id });
    node.children = await Promise.all(node.children.map(child => this.fillTree(child)));
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

    // return await this.fillTree(tree);
    return await this.treeRepository.findDescendantsTree(root);

  }

  async createMasterCapTree(): Promise<CapabilityTree> {
    console.log('im here')
    const capLibs = await this.capabilityLibRepository.find({ status: 'active'});
    
    const masterTree = await this.capabilityTreeRepository.save(new CapabilityTree(masterTreeTemplate));

    await Promise.all(capLibs.map(async capability_lib => {
      const firstLevelChild = await this.capabilityTreeRepository.save(new CapabilityTree({
        parent: masterTree,
        parentId: masterTree.id,
        type: masterTree.type,
        cap_name: capability_lib.name,
        capability_lib,
      }));
    }));
    return masterTree;
  }

  async treeByIndustryTree(industryId: number): Promise<CapabilityTree> {
    const industryParams = { industry_tree_id: industryId, parentId: null, }
    let rootIndustryCapTree = await this.capabilityTreeRepository.findOne(industryParams);

    if (!rootIndustryCapTree) {
      const industryCap = await this.industryTreeRepository.findOne({ id: industryId })
      rootIndustryCapTree = await this.capabilityTreeRepository.save({ cap_name: industryCap.name, industry_tree_id: industryCap.id, parentId: null })

      if (!industryCap) {
        throw new NotFoundException(`capability-tree with industry_tree_id: ${industryId} was not found`);
      }
    }

    const tree = await this.treeRepository.findDescendantsTree(rootIndustryCapTree);
    return sortTreeByField('cap_name', tree);
  }
  // Return all children including node itself (foundChildren is sorted array [parent, child, granchild, ....])
  async getAllChildren(id: number) {
    const node = await this.capabilityTreeRepository.findOne(id)
    const descendantsTree = await this.treeRepository.findDescendantsTree(node)
    const allRelatedIds = (descendantsTree ? flattenTree(descendantsTree, 'children') : []).map(({ id }) => id);
    const foundChildren = await Promise.all(allRelatedIds.map(id => this.findOneById(id)))
    return foundChildren
  }

  // INDUSTRY
  async createIndustry(data: CapabilityTreeIndustryCreationInput): Promise<CapabilityTree> {
  console.log("CapabilityTreeService -> data", data)

    // Meaning user has droped node from master captree into industry
    if (data.type === 'master') {

      const foundChildren = await this.getAllChildren(data.id)
      console.log("CapabilityTreeService -> foundChildren", foundChildren)
      const masterTreeIDtoIndustryId = {}

      await asyncForEach(foundChildren, async ({ id, cap_name, parentId }) => {
        const industry = new CapabilityTree({ cap_name, type: 'industry', industry_tree_id: data.industry_tree_id })
        if (id === data.id) {
          industry.parentId = data.parentId
        } else {
          industry.parentId = parseInt(masterTreeIDtoIndustryId[parentId], 10)
        }
        const industryTree = await this.collectEntityFields(industry)
        const createdIndustry = await this.capabilityTreeRepository.save(industryTree)
        masterTreeIDtoIndustryId[id] = createdIndustry.id
      });

      const rootNodeOfMovedCap = await this.findOneById(masterTreeIDtoIndustryId[data.id])
      console.log("CapabilityTreeService -> rootNodeOfMovedCap", rootNodeOfMovedCap)
      
      return this.treeRepository.findDescendantsTree(rootNodeOfMovedCap)
    } else {
      // this runs when we add sibling or child
      const capabilityTree = await this.collectEntityFields(new CapabilityTree(data));
      capabilityTree.type = 'industry' // just making sure we set type to industry
      return this.capabilityTreeRepository.save(capabilityTree);
    }
  }

  async updateIndustry(id: number, data: CapabilityTreeIndustryCreationInput): Promise<CapabilityTree> {
    const capabilityTree = await this.collectEntityFields(new CapabilityTree(data));
    return this.capabilityTreeRepository.save(capabilityTree);
  }

  async updateIndustryTree(selectedNodeId: number, data: CapabilityTreeIndustryCreationInput): Promise<CapabilityTree> {
    const children = await this.getAllChildren(selectedNodeId)
    const oldCapToNewCapIDs = {}

    await asyncForEach(children, async ({ id, cap_name, parentId }) => {
      const industryCap = new CapabilityTree({ cap_name, type: 'industry', industry_tree_id: data.industry_tree_id })
      if (id === selectedNodeId) {
        industryCap.parentId = data.parentId
      } else {
        industryCap.parentId = parseInt(oldCapToNewCapIDs[parentId], 10)
      }
      const capability = await this.collectEntityFields(industryCap)
      const createdCapability = await this.capabilityTreeRepository.save(capability)
      oldCapToNewCapIDs[id] = createdCapability.id
    });

    // Removing old captrees starting from children 
    // This is neccesary beacuse if we start removing parent we will get foreign key error 
    // because child has parentId and Parent so typeorm won't let us delete it 
    await asyncForEach(children.reverse(), async ({ id }) => {
      await this.capabilityTreeRepository.delete(id)
    });
    
    const rootNodeOfMovedCap = await this.findOneById(oldCapToNewCapIDs[selectedNodeId])
    return this.treeRepository.findDescendantsTree(rootNodeOfMovedCap)
  }


  // MASTER CAPTREE
  async createMaster(data: CapabilityTreeMasterCreationInput): Promise<CapabilityTree> {
    if (data.parentId) {
      const MasterCapLib = await this.capabilityTreeRepository.findOne(masterTreeTemplate);
      data.parentId = MasterCapLib.id
    }
    const capabilityTree = await this.collectEntityFields(new CapabilityTree(data));
    return await this.capabilityTreeRepository.save(capabilityTree);
  }

  async updateMaster(selectedNodeId: number, data: CapabilityTreeInput): Promise<CapabilityTree> {
    // data.prantId = ID of new parrent
    // ID = ID of moved node
    
    const children = await this.getAllChildren(selectedNodeId)
    const oldCapToNewCapIDs = {}

    await asyncForEach(children, async ({ id, cap_name, parentId, capability_lib_id }) => {
      const masterCapability = new CapabilityTree({ cap_name, type: 'master', capability_lib_id })
      if (id === selectedNodeId) {
        masterCapability.parentId = data.parentId
      } else {
        masterCapability.parentId = parseInt(oldCapToNewCapIDs[parentId], 10)
      }
      const capability = await this.collectEntityFields(masterCapability)
      const createdCapability = await this.capabilityTreeRepository.save(capability)
      oldCapToNewCapIDs[id] = createdCapability.id
    });

    // Removing old captrees starting from children 
    // This is neccesary beacuse if we start removing parent we will get foreign key error 
    // because child has parentId and Parent so typeorm won't let us delete it 
    await asyncForEach(children.reverse(), async ({ id }) => {
      await this.capabilityTreeRepository.delete(id)
    });
    
    const rootNodeOfMovedCap = await this.findOneById(oldCapToNewCapIDs[selectedNodeId])
    return this.treeRepository.findDescendantsTree(rootNodeOfMovedCap)
  }

  // MASTER CAPTREE
  async create(data: CapabilityTreeCreationInput): Promise<CapabilityTree> {
    if (data.type === 'master' && !data.parentId) {
      const MasterCapLib = await this.capabilityTreeRepository.findOne(masterTreeTemplate);
      data.parentId = MasterCapLib.id
    }
    const capabilityTree = await this.collectEntityFields(new CapabilityTree(data));
    const capTreeRepositorySave = await this.capabilityTreeRepository.save(capabilityTree);
    return capTreeRepositorySave
  }

  async save(id: number, data: CapabilityTreeInput): Promise<CapabilityTree> {
    data.id = id

    if (data.status === 'inactive') {
      this.unselectCapTree(id)
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
    const cap = await this.capabilityTreeRepository.findOne(id);

    const capChildren = await this.capabilityTreeRepository.find({ where: { parentId: cap.id } });
    capChildren.forEach(async child => {
      child.parentId = cap.parentId
      await this.capabilityTreeRepository.save(child);
    })

    return this.remove(id);

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
      console.log("CapabilityTreeService -> remove -> foundChildren", foundChildren)
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

  // This assigns 
  async unselectCapTree(capToRemoveID: number) {
    const capToRemove = await this.capabilityTreeRepository.findOne(capToRemoveID);

    const children = await this.getAllChildren(capToRemoveID)
    const oldCapToNewCapIDs = {}

    await asyncForEach(children, async ({ id, cap_name, parentId, capability_lib_id }) => {
      const capability = new CapabilityTree({ cap_name, type: 'master', capability_lib_id })
      if (id !== capToRemoveID) {
        if(parentId === capToRemoveID){
          capability.parentId = capToRemove.parentId
        }else{

          capability.parentId = parseInt(oldCapToNewCapIDs[parentId], 10)
        }

        const capabilityEntities = await this.collectEntityFields(capability)
        const createdCapability = await this.capabilityTreeRepository.save(capabilityEntities)
        oldCapToNewCapIDs[id] = createdCapability.id
      }
    });

    // Removing old captrees starting from children 
    // This is neccesary beacuse if we start removing parent we will get foreign key error 
    // because child has parentId and Parent so typeorm won't let us delete it 
    await asyncForEach(children.reverse(), async ({ id }) => {
      await this.capabilityTreeRepository.delete(id)
    });
    
  }

  async switch(id: any, newCapLib: any): Promise<CapabilityTree> {
    const oldCap = await this.capabilityTreeRepository.findOne(id);
    oldCap.cap_name = newCapLib.name
    oldCap.capability_lib_id = newCapLib.id
    return await this.capabilityTreeRepository.save(oldCap);

  }

  private getParentList(entity: CapabilityTree): number[] {
    if (!entity.id) {
      return []
    }
    let result: number[] = []
    result.push(entity.id)
    if (entity.parent) {
      result = [...result, ...this.getParentList(entity.parent)]
    }
    return result
  }

  private getChildList(entities: CapabilityTree[]): number[] {
    let result: number[] = []
    for (const entity of entities) {
      result.push(entity.id)
      if (entity.children) {
        result = [...result, ...this.getChildList(entity.children)]
      }
    }
    return result
  }
}

