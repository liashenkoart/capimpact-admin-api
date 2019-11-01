import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';

import { ProcessQueryInput, ProcessCreationInput, ProcessInput } from '@modules/processes/dto';
import { Process } from './process.entity';

@Injectable()
export class ProcessService {
  constructor(@InjectRepository(Process) private readonly processRepository: Repository<Process>) {}

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
    return this.processRepository.save(process);
  }

  async save(id: number, data: ProcessInput): Promise<Process> {
    const process = new Process({ ...data, id });
    return this.processRepository.save(process);
  }

  async remove(id: number) {
    return this.processRepository.delete(id);
  }

  getFindAllQuery(query: ProcessQueryInput): FindManyOptions {
    const { limit = 100, page = 1, ...where } = query;
    return {
      skip: (page - 1) * limit,
      take: limit,
      where,
    };
  }
}
