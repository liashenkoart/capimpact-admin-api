import { Injectable, forwardRef, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, FindManyOptions, In } from 'typeorm';

import { parseCsv } from '@lib/parseCsv';
import { getPath } from '@lib/getPath';
import { sortTreeByField, flattenTree, asyncForEach } from '@lib/sorting';
import { CapabilityGraphService } from './capability.graph.service';

import { Industry } from '../../industry/industry.entity';
import { Capability } from '../capability.entity';
import { CapabilitiesArgs, CapabilityCreationInput, CapabilityInput } from '../dto';

import { CapabilityTreeService } from "../../capability-tree/capability-tree.service"
import { IndustryService } from "../../industry/service/industry.service";

@Injectable()
export class CapabilityService {
  constructor(
    @Inject(forwardRef(() => IndustryService))
    private readonly industryService: IndustryService,
    @Inject(forwardRef(() => CapabilityTreeService))
    private readonly capTreeSrv: CapabilityTreeService,
    @Inject(forwardRef(() => CapabilityGraphService))
    private readonly capabilityGraphService: CapabilityGraphService,
    @InjectRepository(Capability) private readonly capabilityRepository: Repository<Capability>,
    @InjectRepository(Capability) private readonly treeRepository: TreeRepository<Capability>
  ) {}

  private listToTree(data, options?) {
    options = options || {};
    var ID_KEY = options.idKey || 'id';
    var PARENT_KEY = options.parentKey || 'parentId';
    var CHILDREN_KEY = options.childrenKey || 'children';
  
    var tree = [],
      childrenOf = {};
    var item, id, parentId;
  
    for (var i = 0, length = data.length; i < length; i++) {
      item = data[i];
      id = item[ID_KEY];
      parentId = item[PARENT_KEY] || 0;
      // every item may have children
      childrenOf[id] = childrenOf[id] || [];
      // init its children
      item[CHILDREN_KEY] = childrenOf[id];
      if (parentId != 0) {
        // init its parent's children object
        childrenOf[parentId] = childrenOf[parentId] || [];

        const { capability, ...rest} = item;
        // push it into its parent's children object
        childrenOf[parentId].push({ ...rest, ...capability  });
      } else {
        tree.push(item);
      }
    };
  
    return tree;
  }


  async list() {
    return this.capabilityRepository.find();
  }

  async tree(query: CapabilitiesArgs):Promise<any> {
    const { industry_id, company_id } = query;
    let root = null;
    if (industry_id) {
      root = await this.capTreeSrv.treeRepository.find({ where: {       industry_tree_id:industry_id }, 
      relations:["capability"] });
    } else if (company_id) {
      root = await this.capTreeSrv.treeRepository.find({ where: { company_id }, relations:["capability"] });
    }

    if (!root) {
      throw new NotFoundException();
    }

    const test = this.listToTree(root);
    return test.length > 0 ? test[0] : [];
    return test[0];
  }

  async treeByIndustryTree(query: CapabilitiesArgs): Promise<Capability> {
    
    const { industry_id } = query;
    const rootCapTree = await this.capTreeSrv.capabilityTreeRepository
    .findOne({
      industry_tree_id: industry_id,
      parentId: null,
    });
    const tree = await this.capTreeSrv.treeRepository.findDescendantsTree(rootCapTree);

    if (!rootCapTree) {
      throw new NotFoundException(`capability-tree with industry_tree_id: ${industry_id} was not found`);
    }
 
    return sortTreeByField('cap_name', tree);
  }

  async findAll(query: CapabilitiesArgs): Promise<Capability[] | void> {
    const options = this.getFindAllQuery(query);

    return this.capabilityRepository.find(options);
  }

  async findOneById(id: number): Promise<Capability> {
    return this.capabilityRepository.findOne({ id });
  }

  async countDocuments(query: CapabilitiesArgs): Promise<number> {
    return this.capabilityRepository.count(query);
  }

  async create(data: CapabilityCreationInput, context?: any): Promise<Capability> {
    const { user } = context;
    let capability = new Capability(data);
    capability.parent = await this.findOneById(capability.parentId);
    capability.user = user;
    capability = await this.capabilityRepository.save(capability);
    await this.updateHierarchyIdNode(capability);
    return null;
  }

  createRootNode(industry: Industry, context?: any): Promise<Capability> {
    // save root industry node
    return this.create({
      name: industry.name,
      industry_id: industry.id,
      parentId: null,
    }, context);
  }

  async createDefaultTreeFromIndustry(industry: Industry, root: Capability, context?: any): Promise<void> {
    const { user } = context;
    let data: any = await parseCsv(
      `capabilities/default.csv`,
      rows =>
        // { '1': {...}, '2': {...} ...}
        rows.reduce((o, row) => {
          const hierarchy_id = getPath(row.hierarchy_id);
          return {
            ...o,
            [hierarchy_id]: {
              ...row,
              hierarchy_id,
              industry,
              user,
            },
          };
        }, {}),
      {
        renameHeaders: true,
        headers: ['hierarchy_id', 'name'],
      }
    );
    // Contain saved data by hierarchy_id key
    let groupByHierarchyId = {};
    // Convert to array
    let capabilities: any = Object.values(data);
    // Save capability one by one
    for (let cap of capabilities) {
      // 1.2.3.4.5 -> 1.2.3.4
      let parent = cap.hierarchy_id
        .split('.')
        .slice(0, -1)
        .join('.');
      groupByHierarchyId[cap.hierarchy_id] = await this.capabilityRepository.save({
        ...cap,
        default: true,
        parent: groupByHierarchyId[parent] || root,
      });
    }
  }

  async save(id: any, data: CapabilityInput, context?: any): Promise<Capability> {
    const { user } = context;
    let capability = new Capability({ ...data });
    capability.id = parseInt(id, 10);
    capability.user = user;
    if (capability.parentId) {
      capability.parent = await this.findOneById(capability.parentId);
    }
    capability = await this.capabilityRepository.save(capability);
    capability = await this.capabilityRepository.findOne({ id: capability.id });
    if (capability.parentId === null) {
      await this.industryService.industryRepository.save({ id: +capability.industry_id, name: capability.name });
    }
    await this.updateHierarchyIdNode(capability);
    await this.capabilityGraphService.save(capability.id, capability.name);
    return await this.findOneById(capability.id);
  }

  async saveMany(input: CapabilityInput[], context?: any) {
    const { user } = context;
    let data = []
    await asyncForEach(input, async (cap) => {
      const { tags } = cap;
      let entity = await this.capabilityRepository.findOne({ where: { capability_tree: { id: cap.id } }, relations: ['capability_tree']  });
      if(entity) {
         entity.tags = tags;
         entity.user = user;
         data.push(await this.capabilityRepository.save(entity));
      } else {
          const capability_tree = await this.capTreeSrv.treeRepository.findOne(cap.id);
          const capability = new Capability({name: capability_tree.cap_name, tags, user, capability_tree})
          data.push(await this.capabilityRepository.save(capability));
      }
    })
    //  for (let node of data) {
    //   await this.capabilityGraphService.save(node.id, node.name);
    //  }
    
    // for (let node of data) {
    //   await this.updateHierarchyIdNode(node);
    // }
  
    return data;
  }


  async saveManyTags(input: CapabilityInput[], context?: any) {
    const { user } = context;
    let data = []
    await asyncForEach(input, async (cap) => {
      const { tags } = cap;
      let entity = await this.capabilityRepository.findOne({ where: { capability_tree: { id: cap.id } }, relations: ['capability_tree']  });
      if(entity) {
         entity.tags = tags;
         entity.user = user;
         data.push(await this.capabilityRepository.save(entity));
      } else {
          const capability_tree = await this.capTreeSrv.treeRepository.findOne(cap.id);
          const capability = new Capability({name: capability_tree.cap_name, tags, user, capability_tree})
          data.push(await this.capabilityRepository.save(capability));
      }
    })
    //  for (let node of data) {
    //   await this.capabilityGraphService.save(node.id, node.name);
    //  }
    
    // for (let node of data) {
    //   await this.updateHierarchyIdNode(node);
    // }
  
    return data;
  }


  async saveManyFilters(input: any[], context?: any) {
    const { user } = context;
    let data = []
    await asyncForEach(input, async (cap) => {
      const { filters } = cap;
      let entity = await this.capabilityRepository.findOne({ where: { capability_tree: { id: cap.id } }, relations: ['capability_tree']  });
      if(entity) {
         entity.filters = filters;
         entity.user = user;
         data.push(await this.capabilityRepository.save(entity));
      } else {
          const capability_tree = await this.capTreeSrv.treeRepository.findOne(cap.id);
          const capability = new Capability({name: capability_tree.cap_name, filters, user, capability_tree})
          data.push(await this.capabilityRepository.save(capability));
      }
    })
  
    return data;
  }
  async cloneTreeFromIndustry(id: any, industry: Industry, context?: any): Promise<Capability> {
    const { user } = context;
    const industryId = parseInt(id, 10); // cloned industry id
    let node = null;
    // save root industry node
    let root = await this.capabilityRepository.save({
      name: industry.name,
      default: true,
      industry,
      parent: null,
      user,
    });
    let clonedRoot = await this.capabilityRepository.findOne({ industry_id: industryId, parentId: null });
    if (clonedRoot) {
      const descendantsTree = await this.treeRepository.findDescendantsTree(clonedRoot);
      const descendants = descendantsTree ? flattenTree(descendantsTree, 'children') : [];
      let groupByName = {};
      for (let descendant of descendants) {
        if (descendant.parentId) {
          const parentNode = descendants.find(it => it.id === descendant.parentId);
          const parent = (parentNode && groupByName[parentNode.id]) || root;
          node = await this.capabilityRepository.save({
            name: descendant.name,
            hierarchy_id: descendant.hierarchy_id,
            default: true,
            industry_id: industry.id,
            parent,
            user,
          });
          groupByName[descendant.id] = node;
        }
      }
    }
    return this.tree({ industry_id: industry.id });
  }

  async remove(id: any) {
    id = parseInt(id, 10);
    const node = await this.capabilityRepository.findOne(id);
    if (node) {
      let descendants = await this.treeRepository.findDescendants(node);
      await this.capabilityRepository.remove(descendants);
      await this.capabilityRepository.remove(node);
      if (node.parentId === null) {
        await this.industryService.industryRepository.delete({ id: +node.industry_id });
      }
    }
    return { id };
  }

  async removeByIndustry(industryId: any) {
    return this.capabilityRepository.delete({ industry_id: +industryId });
  }

  getFindAllQuery(query: CapabilitiesArgs): FindManyOptions {
    const { page, skip, limit, ids, ...params } = query;
    let where: any = params;

    if (ids && ids.length) {
      where.id = In(ids);
    }

    return {
      skip: (page - 1) * limit,
      take: limit,
      where,
    };
  }

  async updateHierarchyIdNode(node: Capability): Promise<Capability> {
    if (node.hierarchy_id) return node;
    if (node.company_id) return node; // If capability is created from company we don't give it hierarchy_id
    let hierarchyId = '';
    let maxValue = 0;
    let parent = await this.capabilityRepository.findOne(+node.parentId);
    if (parent && parent.hierarchy_id) {
      hierarchyId = `${parent.hierarchy_id}.`;
    }
    let siblings = await this.capabilityRepository.find({ where: { parentId: +node.parentId } });
    siblings = siblings.filter(n => !!n.hierarchy_id);
    if (siblings && siblings.length) {
      let hierarchyIds = siblings.map(n => +n.hierarchy_id.split('.').pop());
      maxValue = Math.max(...hierarchyIds);
    }
    node.hierarchy_id = `${hierarchyId}${maxValue + 1}`;
    await this.capabilityRepository.save(
      new Capability({ id: node.id, hierarchy_id: node.hierarchy_id })
    );
    return await this.findOneById(node.id);
  }
}
