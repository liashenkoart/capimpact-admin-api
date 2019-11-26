import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, FindManyOptions } from 'typeorm';

import { parseCsv } from '@lib/parseCsv';
import { getPath } from '@lib/getPath';

import { Industry } from '@modules/caps/entities/industry.entity';
import {
  IndustryCreationInput,
  CapabilityQueryInput,
  CapabilityCreationInput,
  CapabilityInput,
} from '@modules/caps/dto';
import { IndustryService } from '@modules/caps/services/industry.service';
import { Capability } from '@modules/caps/entities/capability.entity';
//import { DefaultCapability } from './default-capability.entity';

@Injectable()
export class CapabilityService {
  constructor(
    @Inject(forwardRef(() => IndustryService))
    private readonly industryService: IndustryService,
    @InjectRepository(Capability) private readonly capabilityRepository: Repository<Capability>,
    @InjectRepository(Capability) private readonly treeRepository: TreeRepository<Capability>
  ) {}

  async tree(query: CapabilityQueryInput): Promise<Capability> {
    const { industry_id } = query;
    const root = await this.capabilityRepository.findOne({ industry_id, parentId: null });
    if (!root) {
      throw new NotFoundException();
    }
    return this.treeRepository.findDescendantsTree(root);
  }
  /*
  async defaultTree(query: CapabilityQueryInput): Promise<DefaultCapability> {
    const { industry_id } = query;
    const root = await this.defaultCapabilityRepository.findOne({ industry_id, parentId: null });
    if (!root) {
      throw new NotFoundException();
    }
    return this.defaultTreeRepository.findDescendantsTree(root);
  }
  */

  async findAll(query: CapabilityQueryInput): Promise<Capability[]> {
    const options = this.getFindAllQuery(query);
    return this.capabilityRepository.find(options);
  }

  async findById(id: number): Promise<Capability> {
    return this.capabilityRepository.findOne(id);
  }

  async findByEmail(email: string): Promise<Capability> {
    return this.capabilityRepository.findOne({ where: { email } });
  }

  async create(data: CapabilityCreationInput, context: any): Promise<Capability> {
    const { user } = context;
    const capability = new Capability(data);
    capability.parent = await this.findById(capability.parentId);
    capability.user = user;
    return this.capabilityRepository.save(capability);
  }

  async createTreeFromIndustry(industry: Industry, context: any): Promise<Capability> {
    const { user } = context;
    // save root industry node
    let root = await this.capabilityRepository.save({
      name: industry.name,
      industry,
      parent: null,
      user,
    });
    let data: any = await parseCsv(
      `capabilities/Telco.csv`,
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
    for (let proc of capabilities) {
      // 1.2.3.4.5 -> 1.2.3.4
      let parent = proc.hierarchy_id
        .split('.')
        .slice(0, -1)
        .join('.');
      groupByHierarchyId[proc.hierarchy_id] = await this.capabilityRepository.save({
        ...proc,
        parent: groupByHierarchyId[parent] || root,
      });
    }
    return this.tree({ industry_id: industry.id });
  }

  async save(id: any, data: CapabilityInput, context: any): Promise<Capability> {
    const { user } = context;
    let capability = new Capability({ ...data });
    capability.id = parseInt(id, 10);
    capability.user = user;
    if (capability.parentId) {
      capability.parent = await this.findById(capability.parentId);
    }
    capability = await this.capabilityRepository.save(capability);
    capability = await this.capabilityRepository.findOne({ id: capability.id });
    if (capability.parentId === null) {
      await this.industryService.save(capability.industry_id, { name: capability.name });
    }
    return capability;
  }

  async saveMany(input: CapabilityInput[], context: any) {
    const { user } = context;
    const data = input.map(candidate => {
      let capability = new Capability({ ...candidate });
      capability.user = user;
      return capability;
    });
    return await this.capabilityRepository.save(data);
  }

  async clone(id: any, context: any): Promise<Capability> {
    const { user } = context;
    const industryId = parseInt(id, 10);
    let node = null;
    let industry = await this.industryService.findById(industryId);
    let root = await this.capabilityRepository.findOne({
      industry_id: industryId,
      parentId: null,
    });
    let descendants = await this.treeRepository.findDescendants(root);
    let groupByName = {};
    for (let descendant of descendants) {
      if (descendant.parentId === null) {
        let copiedIndustry = new IndustryCreationInput();
        copiedIndustry.name = `${industry.name} Copy`;
        industry = await this.industryService.create(copiedIndustry);
        root = await this.capabilityRepository.save({
          name: industry.name,
          industry_id: industry.id,
          parent: null,
          user,
        });
      } else {
        const parentNode = descendants.find(it => it.id === descendant.parentId);
        const parent = (parentNode && groupByName[parentNode.name]) || root;
        node = await this.capabilityRepository.save({
          name: descendant.name,
          industry_id: industry.id,
          parent,
          user,
        });
        groupByName[node.name] = node;
      }
    }
    return this.tree({ industry_id: industry.id });
  }

  async remove(id: any): Promise<Capability> {
    id = parseInt(id, 10);
    const node = await this.capabilityRepository.findOne({ id });
    let descendants = await this.treeRepository.findDescendants(node);
    await this.capabilityRepository.remove(descendants);
    await this.capabilityRepository.remove(node);
    if (node.parentId === null) {
      await this.industryService.remove(node.industry_id);
    }
    return node;
  }

  getFindAllQuery(query: CapabilityQueryInput): FindManyOptions {
    const { limit, page, ...where } = query;
    return {
      skip: (page - 1) * limit,
      take: limit,
      where,
    };
  }
}
