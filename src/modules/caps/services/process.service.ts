import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, FindManyOptions } from 'typeorm';

import { parseCsv } from '@lib/parseCsv';
import { getPath } from '@lib/getPath';

import { Neo4jService } from '@modules/neo4j/services';

import { Industry, Process } from '../entities';
import { ProcessesArgs, ProcessCreationInput, ProcessInput } from '../dto';

@Injectable()
export class ProcessService {
  constructor(
    private readonly neo4jService: Neo4jService,
    @InjectRepository(Process) private readonly processRepository: Repository<Process>,
    @InjectRepository(Process) private readonly treeRepository: TreeRepository<Process>,
    @InjectRepository(Industry) private readonly industryRepository: Repository<Industry>
  ) {}

  async tree(query: ProcessesArgs): Promise<Process> {
    const { industry_id } = query;
    const root = await this.processRepository.findOne({ industry_id, parentId: null });
    if (!root) {
      throw new NotFoundException();
    }
    return this.treeRepository.findDescendantsTree(root);
  }

  async defaultTree(query: ProcessesArgs): Promise<any> {
    const { industry_id } = query;
    const industry = await this.industryRepository.findOne(industry_id);
    if (industry) {
      return await this.getDataFromIndustryCsvFile({ industry });
    }
    return null;
  }

  async findAll(query: ProcessesArgs): Promise<Process[]> {
    const options = this.getFindAllQuery(query);
    return this.processRepository.find(options);
  }

  async findOneById(id: number): Promise<Process> {
    return this.processRepository.findOne({ id });
  }

  async countDocuments(query: ProcessesArgs): Promise<number> {
    return this.processRepository.count(query);
  }

  async create(data: ProcessCreationInput, context?: any): Promise<Process> {
    const { user } = context;
    const process = new Process(data);
    process.parent = await this.findOneById(process.parentId);
    process.user = user;
    await this.processRepository.save(process);
    return await this.findOneById(process.id);
  }

  createRootNode(industry: Industry, context?: any): Promise<Process> {
    // save root industry node
    return this.create({
      name: industry.name,
      industry_id: industry.id,
      parentId: null,
    }, context);
  }

  async createDefaultTreeFromIndustry(industry: Industry, root: Process, context?: any): Promise<void> {
    const { user } = context;
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
  }

  async save(id: any, data: ProcessInput, context?: any): Promise<Process> {
    const { user } = context;
    let process = new Process({ ...data });
    process.id = parseInt(id, 10);
    process.user = user;
    if (process.parentId) {
      process.parent = await this.findOneById(process.parentId);
    }
    process = await this.processRepository.save(process);
    process = await this.processRepository.findOne({ id: process.id });
    if (process.parentId === null) {
      await this.industryRepository.save({ id: +process.industry_id, name: process.name });
    }
    await this.neo4jService.saveProcess(process.id, { name: process.name });
    return await this.findOneById(process.id);
  }

  async saveMany(input: ProcessInput[], context?: any) {
    const { user } = context;
    const data = input.map(candidate => {
      let process = new Process({ ...candidate });
      process.user = user;
      return process;
    });
    const result = await this.processRepository.save(data);
    for (let node of result) {
      await this.neo4jService.saveProcess(node.id, { name: node.name });
    }
    return await this.processRepository.findByIds(data.map(p => p.id));
  }

  async cloneTreeFromIndustry(id: any, industry: Industry, context?: any): Promise<Process> {
    const { user } = context;
    const industryId = parseInt(id, 10); // cloned industry id
    let node = null;
    // save root industry node
    let root = await this.processRepository.save({
      name: industry.name,
      industry,
      parent: null,
      user,
    });
    let clonedRoot = await this.processRepository.findOne({
      industry_id: industryId,
      parentId: null,
    });
    let descendants = await this.treeRepository.findDescendants(clonedRoot);
    let groupByName = {};
    for (let descendant of descendants) {
      if (descendant.parentId) {
        const parentNode = descendants.find(it => it.id === descendant.parentId);
        const parent = (parentNode && groupByName[parentNode.id]) || root;
        node = await this.processRepository.save({
          name: descendant.name,
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
    const node = await this.processRepository.findOne({ id });
    let descendants = await this.treeRepository.findDescendants(node);
    await this.processRepository.remove(descendants);
    await this.processRepository.remove(node);
    if (node.parentId === null) {
      await this.industryRepository.delete({ id: +node.industry_id });
    }
    return { id };
  }

  async removeByIndustry(industryId: any) {
    industryId = parseInt(industryId, 10);
    return this.processRepository.delete({ industry_id: industryId });
  }

  getFindAllQuery(query: ProcessesArgs): FindManyOptions {
    const { page, skip, limit, ...where } = query;
    return {
      skip: (page - 1) * limit,
      take: limit,
      where,
    };
  }

  async getDataFromIndustryCsvFile({ industry }) {
    let data: any = await parseCsv(
      `processes/${industry.name}.csv`,
      rows =>
        rows
          .map((row, index) => {
            const id = industry.id * 10000 + index + 1;
            const hierarchy_id = getPath(row.hierarchy_id);
            const industry_id = industry.id;
            const metrics_avail = row.metrics_avail === 'Y';
            const parent_path = hierarchy_id
              .split('.')
              .slice(0, -1)
              .join('.');
            return {
              ...row,
              id,
              hierarchy_id,
              industry_id,
              metrics_avail,
              parent_path,
            };
          })
          .map((row, index, allData) => {
            const parent = allData.find(it => it.hierarchy_id === row.parent_path);
            const parentId = (parent && parent.id) || null;
            return { ...row, parentId, parent_id: parentId };
          }),
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
    return data;
  }
}
