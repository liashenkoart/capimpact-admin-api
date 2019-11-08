import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProcessService } from '@modules/processes/process.service';
import { Process } from '@modules/processes/process.entity';
import { IndustryCreationInput, IndustryInput } from '@modules/industries/dto';
import { Industry } from './industry.entity';

@Injectable()
export class IndustryService {
  constructor(
    @Inject(forwardRef(() => ProcessService))
    private readonly processService: ProcessService,
    @InjectRepository(Industry) private readonly industryRepository: Repository<Industry>
  ) {}

  async findAll(): Promise<Industry[]> {
    return this.industryRepository.find();
  }

  async findById(id: number): Promise<Industry> {
    return this.industryRepository.findOne(id);
  }

  async create(data: IndustryCreationInput): Promise<Industry> {
    const industry = new Industry(data);
    return this.industryRepository.save(industry);
  }

  async createWithTreeProcesses(data: IndustryCreationInput): Promise<Industry> {
    const industry = await this.create(data);
    await this.processService.createTreeFromIndustry(industry);
    return industry;
  }

  async save(id: any, data: IndustryInput): Promise<Industry> {
    const industry = new Industry({ ...data });
    industry.id = parseInt(id, 10);
    return this.industryRepository.save(industry);
  }

  async remove(id: number) {
    return this.industryRepository.delete(id);
  }
}
