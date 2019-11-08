import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, FindManyOptions } from 'typeorm';

import { IndustryService } from '@modules/industries/industry.service';
import { IndustryCreationInput } from '@modules/industries/dto';
import { ProcessQueryInput, ProcessCreationInput, ProcessInput } from '@modules/processes/dto';
import { Process } from './process.entity';

@Injectable()
export class ProcessService {
  constructor(
    @Inject(forwardRef(() => IndustryService))
    private readonly industryService: IndustryService,
    @InjectRepository(Process) private readonly processRepository: Repository<Process>,
    @InjectRepository(Process) private readonly treeRepository: TreeRepository<Process>
  ) {}

  async tree(query: ProcessQueryInput): Promise<Process> {
    const { industry_id } = query;
    const root = await this.processRepository.findOne({ industry_id, parentId: null });
    if (!root) {
      throw new NotFoundException();
    }
    return this.treeRepository.findDescendantsTree(root);
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
        industry = await this.industryService.create(copiedIndustry);
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

  async remove(id: any) {
    id = parseInt(id, 10);
    const node = await this.processRepository.findOne({ id });
    let descendants = await this.treeRepository.findDescendants(node);
    await this.processRepository.remove(descendants);
    await this.processRepository.remove(node);
    if (node.parentId === null) {
      await this.industryService.remove(node.industry_id);
    }
    return true;
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

/*
    @Inject(forwardRef(() => IndustryService))
    private readonly industryService: IndustryService,*/
