
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, Not,IsNull} from 'typeorm';
import { sortTreeByField, flattenTree, asyncForEach } from '@lib/sorting';
import { BaseService } from '@modules/common/services';
import { CapabilityTree, CapabilityLib, IndustryTree, Capability} from '../entities';
import { CapabilityTreesArgs, CapabilityTreeCreationInput, CapabilityTreeIndustryCloneInput, CapabilityTreeLocationDto, OrderDto } from '../dto';
import { CapabilityTreeIndustryCreationInput } from '../dto/capability-tree-industry-creation.dto';
import { CapabilityTreeMasterCreationInput } from '../dto/capability-tree-master-creation.dto';
import { TagService } from "./tag.service";
import { TechnologyService } from "./technology.service";

// const masterTreeTemplate = { type: 'master'};
const masterTreeTemplate = { cap_name: 'Master CapTree', type: 'master', parentId: null };

@Injectable()
export class CapabilityTreeService extends BaseService {
  constructor(
    private tagService: TagService,
    private technologyService: TechnologyService,
    @InjectRepository(CapabilityLib) private readonly capabilityLibRepository: Repository<CapabilityLib>,
    @InjectRepository(IndustryTree) public readonly industryTreeRepository: Repository<IndustryTree>,
    @InjectRepository(CapabilityTree) public readonly capabilityTreeRepository: Repository<CapabilityTree>,
    @InjectRepository(Capability) private readonly capabilityRepository: Repository<Capability>,
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
    return this.capabilityTreeRepository.findOne({where: { id}, relations:['capability'] });
  }

  async fillTree(node): Promise<Object> {
    node.capability_lib = await this.capabilityLibRepository.findOne({ id: node.capability_lib_id });
    node.children = await Promise.all(node.children.map(child => this.fillTree(child)));
    return node;
  }

  async updateTreeOrder(orders: OrderDto[]): Promise<void> {
    const caps:CapabilityTree[] = await this.capabilityTreeRepository.findByIds(orders.map((o) => o.id))
          await asyncForEach(caps, async (entity: CapabilityTree) => {
          const item = orders.find((e) => e.id === entity.id);
          entity.hierarchy_id = item.order;
          await this.capabilityTreeRepository.save(entity)
    });
  }

  async update(id,service, list:[]) {
    const entity = await this.capabilityTreeRepository.findOne(id);
    entity.tags = await service(list);
    return  await this.capabilityTreeRepository.save(new CapabilityTree(entity));
  }

  async updateTags(id,dto) {
    const entity = await this.capabilityTreeRepository.findOne(id);
    entity.tags = await this.tagService.addTagIfNew(dto.list);
    return  await this.capabilityTreeRepository.save(new CapabilityTree(entity));
  }

  async getTags(id) {
    const entity = await this.capabilityTreeRepository.findOne(id);
    const list = await this.tagService.tagRepository.findByIds(entity.tags);
   return { id: 1, list}
  }

  async updateTechs(id,dto) {
    const entity = await this.capabilityTreeRepository.findOne(id);
    entity.technologies = await this.technologyService.addTechIfNew(dto.list);
    return  await this.capabilityTreeRepository.save(new CapabilityTree(entity));
  }

  async getTechs(id) {
    const entity = await this.capabilityTreeRepository.findOne(id);
    const list = await this.technologyService.technologyRepository.findByIds(entity.technologies ? entity.technologies : []);
   return { id: 1, list}
  }

  async createKpi(data): Promise<CapabilityTree | Capability>{

    const cap_tree = await this.capabilityTreeRepository.findOne({ where: {id:data.id }, relations:['capability']})

    if(cap_tree.capability){
      const capability = await this.capabilityRepository.findOne(cap_tree.capability.id)
      capability.kpis = data.kpis

      return await this.capabilityRepository.save(capability)
    } else {
      const capability = new Capability({
        name: data.cap_name,
        kpis: data.kpis
      })
      const createdCapability = await this.capabilityRepository.save(capability)

      cap_tree.capability = createdCapability
      return await this.capabilityTreeRepository.save(cap_tree) 
    }
  }

  // Return all children including node itself by industry_id
  async getAllChildrenOfIndustry(industry_tree_id: number): Promise<CapabilityTree[]> {
    let node = await this.treeRepository.findOne({where:{ industry_tree_id}})
    if(!node) {
      const industryCap = await this.industryTreeRepository.findOne(industry_tree_id) 
      node = await this.treeRepository.save({ cap_name: industryCap.name, industry_id: industryCap.id, parentId: null })
      if (!industryCap) {
        throw new NotFoundException(`s with industry_tree_id: ${industry_tree_id} was not found`);
      }
    }
    return this.getAllChildrenOfNode(node);
  }

 async getAllChildrenOfNode(node:CapabilityTree): Promise<CapabilityTree[]> {
    const descendantsTree = await this.treeRepository.findDescendantsTree(node)
    const allRelatedIds = (descendantsTree ? flattenTree(descendantsTree, 'children') : []).map(({ id }) => id);
    const foundChildren = await Promise.all(allRelatedIds.map(id => this.findOneById(id)))
    return foundChildren
  }

  // Return all children including node itself (foundChildren is sorted array [parent, child, granchild, ....])
  async getAllChildrenById(id: number): Promise<CapabilityTree[]> {
    const node = await this.capabilityTreeRepository.findOne(id)
    return this.getAllChildrenOfNode(node);
  }

  async getAllChildrenbyCompanyId(company_id: number): Promise<CapabilityTree[]>  {
    const node = await this.capabilityTreeRepository.findOne({company_id})
    return this.getAllChildrenOfNode(node);
  }

  // INDUSTRY
  async treeByIndustryTree(industryId: number): Promise<CapabilityTree> {
    const industryParams = { industry_tree_id: industryId, parentId: null, }
    let rootIndustryCapTree = await this.capabilityTreeRepository.findOne({where: industryParams, relations: ['capability']});

    if (!rootIndustryCapTree) {
      const industryCap = await this.industryTreeRepository.findOne({ id: industryId })
      rootIndustryCapTree = await this.capabilityTreeRepository.save({ cap_name: industryCap.name, industry_tree_id: industryCap.id, parentId: null })

      if (!industryCap) {
        throw new NotFoundException(`capability-tree with industry_tree_id: ${industryId} was not found`);
      }
    }

    const tree = await this.treeRepository.findDescendantsTree(rootIndustryCapTree);

    return sortTreeByField('hierarchy_id', tree);
  }

  async cloneIndustry(data: CapabilityTreeIndustryCloneInput): Promise<CapabilityTree>{
    const rootIndustry = await this.findOneById(data.id)
    const rootChildren = await this.getAllChildrenById(data.id)
    rootChildren.shift() // REMOVING ROOT INDUSTRY THAT IS ALREADY CREATED SO WE DON"T RECREATE IT

    if(rootChildren.length > 0){
      await asyncForEach(rootChildren.reverse(), async ({ id }) => {
        await this.capabilityTreeRepository.delete(id)
      });
    }

    const parentChildren = await this.getAllChildrenById(data.parentId)
    parentChildren.shift() // REMOVING ROOT INDUSTRY THAT IS ALREADY CREATED SO WE DON"T RECREATE IT
    const oldCapToNewCapIDs = {}

    const { industry_tree_id } = rootIndustry;
    await asyncForEach(parentChildren, async ({ id, cap_name, parentId, capability, tags }) => {

      const newCap = new CapabilityTree({ cap_name, parentId, type: 'industry', industry_tree_id, tags })
      if (parentId === data.parentId) {
          newCap.parentId = data.id
      } else {
          newCap.parentId = parseInt(oldCapToNewCapIDs[parentId], 10)
      }
        
      const cap = await this.collectEntityFields(newCap)  

      if(capability){
        cap.capability =  await this.capabilityRepository.save(new Capability({
          name: cap.cap_name,
          kpis: capability.kpis
        }))
      }
      const createdCapability = await this.capabilityTreeRepository.save(cap)

      oldCapToNewCapIDs[id] = createdCapability.id
    });

    return this.treeRepository.findDescendantsTree(rootIndustry)
  }

  async createCompany(data: CapabilityTreeIndustryCreationInput): Promise<CapabilityTree> {
    return this.createTree(data,'company')
  }

  async createIndustry(data: CapabilityTreeIndustryCreationInput): Promise<CapabilityTree> {
    // Meaning user has droped node from master captree into industry

    if (data.type === 'master') {
       return this.createTree(data,'industry')
    } else {
      // this runs when we add sibling or child
      const capabilityTree = await this.collectEntityFields(new CapabilityTree(data));
      capabilityTree.type = 'industry' // just making sure we set type to industry
      return this.capabilityTreeRepository.save(capabilityTree);
    }
  }

  async createMaster(data: CapabilityTreeMasterCreationInput): Promise<CapabilityTree> {
    if (data.parentId) {
      const MasterCapLib = await this.capabilityTreeRepository.findOne(masterTreeTemplate);
      data.parentId = MasterCapLib.id
    }
    const capabilityTree = await this.collectEntityFields(new CapabilityTree(data));
    return await this.capabilityTreeRepository.save(capabilityTree);
  }

  async updateIndustry(id: number, data: CapabilityTreeIndustryCreationInput): Promise<CapabilityTree> {
    const capabilityTree = await this.collectEntityFields(new CapabilityTree(data));
    return this.capabilityTreeRepository.save(capabilityTree);
  }

  async getLocation(id: string): Promise<CapabilityTreeLocationDto> {
     const cap = await this.treeRepository.findOne({where: {id} })
     if(!cap) throw new NotFoundException()
     return this.toLocationObj(cap)
  }

  private toLocationObj(entity): CapabilityTreeLocationDto {
    return { cap_id: entity.id, ...entity.location};
  }

  async saveLocation(dto:CapabilityTreeLocationDto): Promise<CapabilityTreeLocationDto> {
    const { cap_id, ...rest } = dto;
    let cap = await this.treeRepository.findOne(cap_id)
    if(!cap) throw new NotFoundException()
    cap.location = rest;
    cap = await this.treeRepository.save(cap)
    return this.toLocationObj(cap);
  }

  // COMPANY
  async treeByCompanyTree(company_id: number): Promise<CapabilityTree> {
    const companyParams = { company_id, parentId: null, }
    let rootCompanyTree = await this.capabilityTreeRepository.findOne(companyParams);

    if (!rootCompanyTree) {
        throw new NotFoundException(`capability-tree with company_id: ${company_id} was not found`);
    }

    const tree = await this.treeRepository.findDescendantsTree(rootCompanyTree);
    return sortTreeByField('hierarchy_id', tree);
  }

  async createTree(data: CapabilityTreeIndustryCreationInput, type: 'industry' | 'company'): Promise<CapabilityTree>  {
      const foundChildren = await this.getAllChildrenById(data.id)
      const masterTreeIDtoIndustryId = {}
 console.log("old order",data.orders)

      await asyncForEach(foundChildren, async ({ id, cap_name, capability, parentId, capability_lib_id, tags }) => {
        let params = { cap_name,capability_lib_id, tags, type }
        if(type === 'industry') {
          params['industry_tree_id'] = data.industry_tree_id;
        } else if (type === 'company') { 
          params['company_id'] = data.company_id;
          
        }
        const industry = new CapabilityTree(params)
        // IparentId of industry equals parentId of moved node or newly created industry
        industry.parentId = id === data.id ? data.parentId : parseInt(masterTreeIDtoIndustryId[parentId], 10)

        const industryTree = await this.collectEntityFields(industry)
        if(capability){
          industryTree.capability =  await this.capabilityRepository.save(new Capability({
            name: industryTree.cap_name,
            kpis: capability.kpis
          }))
        }
        const createdIndustry = await this.capabilityTreeRepository.save(industryTree);
        if(id === data.id ) {
          let str = JSON.stringify(data.orders);
          str = str.replace(id,createdIndustry.id.toString());
          data.orders = JSON.parse(str);
        }

        masterTreeIDtoIndustryId[id] = createdIndustry.id
      });


      if(data.orders) {
        console.log("new order",data.orders)

        await this.updateTreeOrder(data.orders) 
      }
      

      const rootNodeOfMovedCap = await this.findOneById(masterTreeIDtoIndustryId[data.id])
      console.log("CapabilityTreeService -> rootNodeOfMovedCap", rootNodeOfMovedCap)
      
      return this.treeRepository.findDescendantsTree(rootNodeOfMovedCap)
  }

  async updateCompany(id: number, data: CapabilityTreeIndustryCreationInput): Promise<CapabilityTree> {
    const capabilityTree = await this.collectEntityFields(new CapabilityTree(data));
    return this.capabilityTreeRepository.save(capabilityTree);
  }

  // MASTER CAPTREE
  async findMasterCapTree(): Promise<Object> {
    let root = await this.capabilityTreeRepository.findOne(masterTreeTemplate);
    if (!root) {
      root = await this.createMasterCapTree();
    }

    const tree = await this.treeRepository.findDescendantsTree(root);

    return sortTreeByField('hierarchy_id', tree);
  }

  async createMasterCapTree(): Promise<CapabilityTree> {

    const capLibs = await this.capabilityLibRepository.find({ status: 'active'});
    
    const masterTree = await this.capabilityTreeRepository.save(new CapabilityTree(masterTreeTemplate));

    await Promise.all(capLibs.map(async capability_lib => {
    await this.capabilityTreeRepository.save(new CapabilityTree({
        parent: masterTree,
        parentId: masterTree.id,
        type: masterTree.type,
        cap_name: capability_lib.name,
        capability_lib_id: capability_lib.id,
        capability_lib,
      }));
    }));
    return masterTree;
  }

  async updateTreeStructure(selectedNodeId: number, data): Promise<CapabilityTree> {
    const { parentId } = data;
    const parent = await this.capabilityTreeRepository.findOne(parentId);
    const entity = await this.capabilityTreeRepository.findOne(selectedNodeId);
          entity.parent = parent;
    await this.treeRepository.save(entity);
    if(data.orders) await this.updateTreeOrder(data.orders) 
    const rootNodeOfMovedCap = await this.findOneById(selectedNodeId)       
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

  async save(id: number, data): Promise<CapabilityTree> {
        data.id = id
    if (data.status === 'inactive') {
        this.removeOneCapTree(id)
    }
    const capabilityTree = await this.collectEntityFields(new CapabilityTree(data));
    return this.capabilityTreeRepository.save(capabilityTree);
  }

  async delete_many(capIds: number[]): Promise<CapabilityTree> {
    const node = await this.capabilityTreeRepository.findOne(capIds[0])
    await this.capabilityTreeRepository.delete(capIds);
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
    const { parentId, capability_lib_id, industry_tree_id} = capabilityTree;
    if (parentId) {
        capabilityTree.parent = await this.findOneById(parentId);
    }
    if (capability_lib_id) {
        capabilityTree.capability_lib = await this.capabilityLibRepository.findOne(capability_lib_id);
    }
    if (industry_tree_id) {
        capabilityTree.industry_tree = await this.industryTreeRepository.findOne(industry_tree_id);
    }
    return capabilityTree;
  }

  // This assigns 
  async removeOneCapTree(capToRemoveID: number): Promise<any> {
    await this.capabilityRepository.query(`ALTER TABLE capability_tree DISABLE TRIGGER ALL`)
    await this.capabilityRepository.query(`ALTER TABLE capability_tree DROP CONSTRAINT "FK_39f6b72b3f538f5a7d881acd532", ADD CONSTRAINT "FK_39f6b72b3f538f5a7d881acd532" FOREIGN KEY ("parentId") REFERENCES capability_tree(id) ON DELETE CASCADE;`)
   
    const capToDelete = await this.capabilityTreeRepository.findOne(capToRemoveID);
 
   // remove dependant tree relations
   await this.capabilityTreeRepository
        .createQueryBuilder()
        .delete()
        .from('capability_tree')
        .where('"parentId" = :id', { id: capToDelete.id })
        .execute();
        
    await this.capabilityTreeRepository.remove(capToDelete);
    return capToDelete;
  }

  async switch(id: any, newCapLib: any): Promise<CapabilityTree> {
    const oldCap = await this.capabilityTreeRepository.findOne(id);
    oldCap.cap_name = newCapLib.name
    oldCap.capability_lib_id = newCapLib.id
    return await this.capabilityTreeRepository.save(oldCap);
  }
}