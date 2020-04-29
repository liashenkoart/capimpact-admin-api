import { Injectable, HttpService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Industry } from '../entities';
import { IndustryCreationInput, IndustryInput, IndustriesArgs } from '../dto';

import { ProcessService } from './process.service';
import { CapabilityService } from './capability.service';
import { CompanyService } from './company.service';
import { ValueDriverService } from './value-driver.service';

@Injectable()
export class IndustryService {
  constructor(
    private readonly processService: ProcessService,
    private readonly capabilityService: CapabilityService,
    private readonly companyService: CompanyService,
    private readonly valueDriverService: ValueDriverService,
    @InjectRepository(Industry) private readonly industryRepository: Repository<Industry>,
    private readonly httpService: HttpService
  ) {}

  async findAll(args: IndustriesArgs): Promise<Industry[]> {
    let industries = [];
    let result = await this.industryRepository.find({ where: args, order: { name: 'ASC' } });
    for (let industry of result) {
      const countProcesses = await this.processService.countDocuments({ industry_id: industry.id });
      const countCapabilities = await this.capabilityService.countDocuments({
        industry_id: industry.id,
      });
      const countCompanies = await this.companyService.countDocuments({
        industry_id: industry.id,
      });
      /*
      const { data } = await this.httpService
        .get(
          `http://35.153.253.163:5001/api/v1/startups/industry/count?industry_id=${industry.id}`,
          {
            responseType: 'json',
            headers: {
              Authorization: `Bearer ${process.env.TOKEN_STARTUPS_API}`,
            },
          }
        )
        .toPromise();
      */
      const countStartups = 1; //data.total;
      industries.push({
        ...industry,
        countProcesses,
        countCapabilities,
        countCompanies,
        countStartups,
      });
    }
    return industries;
  }

  async findOneById(id: number): Promise<Industry> {
    return this.industryRepository.findOne(id);
  }

  async create(data: IndustryCreationInput, context?: any): Promise<Industry> {
    let industry = new Industry(data);
    industry = await this.industryRepository.save(industry);
    await this.processService.createTreeFromIndustry(industry, context);
    await this.capabilityService.createTreeFromIndustry(industry, context);
    await this.valueDriverService.createTreeFromIndustry(industry, context);
    console.timeEnd('creating');
    return industry;
  }

  async clone(id: number, data: IndustryCreationInput, context?: any): Promise<Industry> {
    let industry = new Industry(data);
    industry = await this.industryRepository.save(industry);
    await this.processService.cloneTreeFromIndustry(id, industry, context);
    await this.capabilityService.cloneTreeFromIndustry(id, industry, context);
    await this.valueDriverService.cloneTreeFromIndustry(id, industry, context);
    return industry;
  }

  async save(id: any, data: IndustryInput): Promise<Industry> {
    const industry = new Industry({ ...data });
    industry.id = parseInt(id, 10);
    return this.industryRepository.save(industry);
  }

  async saveMany(input: IndustryInput[], context?: any) {
    const data = input.map(candidate => new Industry({ ...candidate }));
    await this.industryRepository.save(data);
    return await this.industryRepository.findByIds(data.map(p => p.id));
  }

  async remove(id: number) {
    await this.processService.removeByIndustry(id);
    await this.capabilityService.removeByIndustry(id);
    await this.valueDriverService.removeByIndustry(id);
    await this.industryRepository.delete(id);
    return { id };
  }
}
