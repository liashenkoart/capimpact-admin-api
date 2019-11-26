import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProcessService } from './process.service';
import { CapabilityService } from './capability.service';
import { IndustryCreationInput, IndustryInput } from '@modules/caps/dto';
import { Industry } from '@modules/caps/entities/industry.entity';

@Injectable()
export class IndustryService {
  constructor(
    private readonly processService: ProcessService,
    private readonly capabilityService: CapabilityService,
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

  async createWithTreeProcesses(data: IndustryCreationInput, context: any): Promise<Industry> {
    const industry = await this.create(data);
    await this.processService.createTreeFromIndustry(industry, context);
    return industry;
  }

  async createWithTreeCapabilities(data: IndustryCreationInput, context: any): Promise<Industry> {
    const industry = await this.create(data);
    await this.capabilityService.createTreeFromIndustry(industry, context);
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
