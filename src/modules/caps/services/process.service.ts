import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, FindManyOptions } from 'typeorm';

import { parseCsv } from '@lib/parseCsv';
import { getPath } from '@lib/getPath';

import { Industry } from '@modules/caps/entities/industry.entity';
import { IndustryService } from '@modules/caps/services/industry.service';

import {
  IndustryCreationInput,
  ProcessQueryInput,
  ProcessCreationInput,
  ProcessInput,
} from '@modules/caps/dto';
import { Process } from '@modules/caps/entities/process.entity';
import { DefaultProcess } from '@modules/caps/entities/default-process.entity';

@Injectable()
export class ProcessService {
  constructor(
    @InjectRepository(Process) private readonly processRepository: Repository<Process>,
    @InjectRepository(Process) private readonly treeRepository: TreeRepository<Process>,
    @InjectRepository(DefaultProcess)
    private readonly defaultProcessRepository: Repository<DefaultProcess>,
    @InjectRepository(DefaultProcess)
    private readonly defaultTreeRepository: TreeRepository<DefaultProcess>,
    @Inject(forwardRef(() => IndustryService))
    private readonly industryService: IndustryService
  ) {}

  async tree(query: ProcessQueryInput): Promise<Process> {
    const { industry_id } = query;
    const root = await this.processRepository.findOne({ industry_id, parentId: null });
    if (!root) {
      throw new NotFoundException();
    }
    return this.treeRepository.findDescendantsTree(root);
  }

  async defaultTree(query: ProcessQueryInput): Promise<DefaultProcess> {
    const { industry_id } = query;
    const root = await this.defaultProcessRepository.findOne({ industry_id, parentId: null });
    if (!root) {
      throw new NotFoundException();
    }
    return this.defaultTreeRepository.findDescendantsTree(root);
  }

  async findAll(query: ProcessQueryInput): Promise<Process[]> {
    const options = this.getFindAllQuery(query);
    return this.processRepository.find(options);
  }

  async findById(id: number): Promise<Process> {
    return this.processRepository.findOne(id);
  }

  async findByEmail(email: string): Promise<Process> {
    return this.processRepository.findOne({ where: { email } });
  }

  async create(data: ProcessCreationInput, context: any): Promise<Process> {
    const { user } = context;
    const process = new Process(data);
    process.parent = await this.findById(process.parentId);
    process.user = user;
    return this.processRepository.save(process);
  }

  async createTreeFromIndustry(industry: Industry, context: any): Promise<Process> {
    const { user } = context;
    // save root industry node
    let root = await this.processRepository.save({
      name: industry.name,
      industry,
      parent: null,
      user,
    });
    let data: any = await parseCsv(
      `processes/default.csv`,
      rows =>
        // { '1': {...}, '2': {...} ...}
        rows.reduce((o, row) => {
          const hierarchy_id = getPath(row.hierarchy_id);
          return {
            ...o,
            [hierarchy_id]: {
              ...row,
              metrics_avail: row.metrics_avail === 'Y',
              hierarchy_id,
              industry,
              user,
            },
          };
        }, {}),
      {
        renameHeaders: true,
        headers: [
          'pcf_id',
          'hierarchy_id',
          'name',
          'difference_idx',
          'change_details',
          'metrics_avail',
        ],
      }
    );
    // Contain saved data by hierarchy_id key
    let groupByHierarchyId = {};
    // Convert to array
    let processes: any = Object.values(data);
    // Save process one by one
    for (let proc of processes) {
      // 1.2.3.4.5 -> 1.2.3.4
      let parent = proc.hierarchy_id
        .split('.')
        .slice(0, -1)
        .join('.');
      groupByHierarchyId[proc.hierarchy_id] = await this.processRepository.save({
        ...proc,
        parent: groupByHierarchyId[parent] || root,
      });
    }
    return this.tree({ industry_id: industry.id });
  }

  async save(id: any, data: ProcessInput, context: any): Promise<Process> {
    const { user } = context;
    let process = new Process({ ...data });
    process.id = parseInt(id, 10);
    process.user = user;
    if (process.parentId) {
      process.parent = await this.findById(process.parentId);
    }
    process = await this.processRepository.save(process);
    process = await this.processRepository.findOne({ id: process.id });
    if (process.parentId === null) {
      await this.industryService.save(process.industry_id, { name: process.name });
    }
    return process;
  }

  async saveMany(input: ProcessInput[], context: any) {
    const { user } = context;
    const data = input.map(candidate => {
      let process = new Process({ ...candidate });
      process.user = user;
      return process;
    });
    return await this.processRepository.save(data);
  }

  /*
  async clone(id: any, context: any): Promise<Process> {
    const { user } = context;
    const industryId = parseInt(id, 10);
    let node = null;
    let industry = await this.industryService.findById(industryId);
    let root = await this.processRepository.findOne({ industry_id: industryId, parentId: null });
    let descendants = await this.treeRepository.findDescendants(root);
    let groupByName = {};
    for (let descendant of descendants) {
      if (descendant.parentId === null) {
        let copiedIndustry = new IndustryCreationInput();
        copiedIndustry.name = `${industry.name} Copy`;
        industry = await this.industryService.create(copiedIndustry, context);
        root = await this.processRepository.save({
          name: industry.name,
          industry_id: industry.id,
          parent: null,
          user,
        });
      } else {
        const parentNode = descendants.find(it => it.id === descendant.parentId);
        const parent = (parentNode && groupByName[parentNode.name]) || root;
        node = await this.processRepository.save({
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
  */

  async remove(id: any) {
    id = parseInt(id, 10);
    const node = await this.processRepository.findOne({ id });
    let descendants = await this.treeRepository.findDescendants(node);
    await this.processRepository.remove(descendants);
    await this.processRepository.remove(node);
    if (node.parentId === null) {
      await this.industryService.remove(node.industry_id);
    }
    return { id };
  }

  async removeByIndustry(industryId: any) {
    industryId = parseInt(industryId, 10);
    return this.processRepository.delete({ industry_id: industryId });
  }

  getFindAllQuery(query: ProcessQueryInput): FindManyOptions {
    const { limit, page, ...where } = query;
    return {
      skip: (page - 1) * limit,
      take: limit,
      where,
    };
  }
}
