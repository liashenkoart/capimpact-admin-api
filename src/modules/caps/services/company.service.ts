import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';

import { Company } from '@modules/caps/entities';
import { ProcessService } from './process.service';
import { CapabilityService } from './capability.service';
import { IndustryService } from './industry.service';
import { CompanyCreationInput, CompanyInput, CompaniesArgs } from '@modules/caps/dto';

@Injectable()
export class CompanyService {
  constructor(
    private readonly processService: ProcessService,
    private readonly capabilityService: CapabilityService,
    private readonly industryService: IndustryService,
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>
  ) {}

  async findAll(query: CompaniesArgs): Promise<Company[]> {
    const options = this.getFindAllQuery(query);
    let result = await this.companyRepository.find(options);
    return result;
  }

  async findOneById(id: number): Promise<Company> {
    return this.companyRepository.findOne(id);
  }

  async create(data: CompanyCreationInput, context: any): Promise<Company> {
    const { user } = context;
    let company = new Company(data);
    company.user = user;
    company = await this.companyRepository.save(company);
    return company;
  }

  async clone(id: number, data: CompanyCreationInput, context: any): Promise<Company> {
    let company = new Company(data);
    company = await this.companyRepository.save(company);
    return company;
  }

  async save(id: any, data: CompanyInput): Promise<Company> {
    const company = new Company({ ...data });
    company.id = parseInt(id, 10);
    return this.companyRepository.save(company);
  }

  async saveMany(input: CompanyInput[], context: any) {
    const { user } = context;
    const data = input.map(candidate => {
      let company = new Company({ ...candidate });
      company.user = user;
      return company;
    });
    let result = await this.companyRepository.save(data);
    return await this.companyRepository.findByIds(data.map(p => p.id));
  }

  async remove(id: number) {
    await this.companyRepository.delete(id);
    return { id };
  }

  getFindAllQuery(query: CompaniesArgs): FindManyOptions {
    const { page, skip, limit, ...where } = query;
    return {
      skip: (page - 1) * limit,
      take: limit,
      where,
    };
  }
}
