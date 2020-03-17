import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, FindManyOptions, In } from 'typeorm';

import { parseCsv } from '@lib/parseCsv';
import { getPath } from '@lib/getPath';

import { Neo4jService } from '@modules/neo4j/services';

import { Industry, Capability } from '../entities';
import { CapabilitiesArgs, CapabilityCreationInput, CapabilityInput } from '../dto';

@Injectable()
export class CapabilityService {
  constructor(
    private readonly neo4jService: Neo4jService,
    @InjectRepository(Capability) private readonly capabilityRepository: Repository<Capability>,
    @InjectRepository(Capability) private readonly treeRepository: TreeRepository<Capability>,
    @InjectRepository(Industry) private readonly industryRepository: Repository<Industry>
  ) {}

  async tree(query: CapabilitiesArgs): Promise<Capability> {
    const { industry_id, company_id } = query;
    let root = null;
    if (industry_id) {
      root = await this.capabilityRepository.findOne({ industry_id, parentId: null });
    } else if (company_id) {
      root = await this.capabilityRepository.findOne({ company_id, parentId: null });
    }
    if (!root) {
      throw new NotFoundException();
    }
    return this.treeRepository.findDescendantsTree(root);
  }

  async findAll(query: CapabilitiesArgs): Promise<Capability[] | void> {
    const options = this.getFindAllQuery(query);

    return this.capabilityRepository.find(options);
  }

  async findOneById(id: number): Promise<Capability> {
    return this.capabilityRepository.findOne(id);
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
    return await this.findOneById(capability.id);
  }

  async createTreeFromIndustry(industry: Industry, context?: any): Promise<Capability> {
    const { user } = context;
    // save root industry node
    let root = await this.capabilityRepository.save({
      name: industry.name,
      default: true,
      industry,
      parent: null,
      user,
    });
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
    return this.tree({ industry_id: industry.id });
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
      await this.industryRepository.save({ id: +capability.industry_id, name: capability.name });
    }
    await this.updateHierarchyIdNode(capability);
    await this.neo4jService.saveCapability(capability.id, { name: capability.name });
    return await this.findOneById(capability.id);
  }

  async saveMany(input: CapabilityInput[], context?: any) {
    const { user } = context;
    const data = input.map(candidate => {
      let capability = new Capability({ ...candidate });
      capability.user = user;

      return capability;
    });

    let result = await this.capabilityRepository.save(data);
    for (let node of result) {
      await this.neo4jService.saveCapability(node.id, { name: node.name });
    }
    /*
    for (let node of result) {
      await this.updateHierarchyIdNode(node);
    }
    */
    return await this.capabilityRepository.findByIds(data.map(p => p.id));
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
    let clonedRoot = await this.capabilityRepository.findOne({
      industry_id: industryId,
      parentId: null,
    });
    let descendants = await this.treeRepository.findDescendants(clonedRoot);
    let groupByName = {};
    for (let descendant of descendants) {
      if (descendant.parentId) {
        const parentNode = descendants.find(it => it.id === descendant.parentId);
        const parent = (parentNode && groupByName[parentNode.id]) || root;
        node = await this.capabilityRepository.save({
          name: descendant.name,
          default: true,
          industry_id: industry.id,
          parent,
          user,
        });
        groupByName[descendant.id] = node;
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
        await this.industryRepository.delete({ id: +node.industry_id });
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
