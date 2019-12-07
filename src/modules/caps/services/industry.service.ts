import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProcessService } from './process.service';
import { CapabilityService } from './capability.service';
import { IndustryCreationInput, IndustryInput, IndustriesArgs } from '@modules/caps/dto';
import { Industry } from '@modules/caps/entities/industry.entity';

@Injectable()
export class IndustryService {
  constructor(
    private readonly processService: ProcessService,
    private readonly capabilityService: CapabilityService,
    @InjectRepository(Industry) private readonly industryRepository: Repository<Industry>
  ) {}

  async findAll(args: IndustriesArgs): Promise<Industry[]> {
    return this.industryRepository.find({ order: { name: 'ASC' } });
  }

  async findById(id: number): Promise<Industry> {
    return this.industryRepository.findOne(id);
  }

  async create(data: IndustryCreationInput, context: any): Promise<Industry> {
    let industry = new Industry(data);
    industry = await this.industryRepository.save(industry);
    await this.processService.createTreeFromIndustry(industry, context);
    await this.capabilityService.createTreeFromIndustry(industry, context);
    return industry;
  }

  async clone(id: number, data: IndustryCreationInput, context: any): Promise<Industry> {
    let industry = new Industry(data);
    industry = await this.industryRepository.save(industry);
    await this.processService.createTreeFromIndustry(industry, context);
    await this.capabilityService.createTreeFromIndustry(industry, context);
    return industry;
  }

  async cloneWithProcesses(
    id: number,
    data: IndustryCreationInput,
    context: any
  ): Promise<Industry> {
    let industry = new Industry(data);
    industry = await this.industryRepository.save(industry);
    await this.processService.createTreeFromIndustry(industry, context);
    return industry;
  }

  async cloneWithCapabilities(
    id: number,
    data: IndustryCreationInput,
    context: any
  ): Promise<Industry> {
    let industry = new Industry(data);
    industry = await this.industryRepository.save(industry);
    await this.capabilityService.createTreeFromIndustry(industry, context);
    return industry;
  }

  /*
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
  */

  async save(id: any, data: IndustryInput): Promise<Industry> {
    const industry = new Industry({ ...data });
    industry.id = parseInt(id, 10);
    return this.industryRepository.save(industry);
  }

  async remove(id: number) {
    await this.processService.removeByIndustry(id);
    await this.capabilityService.removeByIndustry(id);
    await this.industryRepository.delete(id);
    return { id };
  }
}
