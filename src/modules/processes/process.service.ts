import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, FindManyOptions } from 'typeorm';

import { ProcessQueryInput, ProcessCreationInput, ProcessInput } from '@modules/processes/dto';
import { Process } from './process.entity';

@Injectable()
export class ProcessService {
  constructor(
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

  async create(data: ProcessCreationInput): Promise<Process> {
    const process = new Process(data);
    process.parent = await this.findById(process.parentId);
    return this.processRepository.save(process);
  }

  async save(id: any, data: ProcessInput): Promise<Process> {
    const process = new Process({ ...data });
    process.id = parseInt(id, 10);
    if (process.parentId) {
      process.parent = await this.findById(process.parentId);
    }
    return this.processRepository.save(process);
  }

  async remove(id: any) {
    return this.processRepository.delete(parseInt(id, 10));
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
