import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, FindManyOptions, AdvancedConsoleLogger } from 'typeorm';

import { Company, Capability, IndustryTree, CapabilityTree } from '../entities';
import { CompanyCreationInput, CompanyInput, CompaniesArgs } from '../dto';
import { asyncForEach } from '@lib/sorting';
import { CapabilityTreeService } from './capability-tree.service';
import { each } from 'lodash';
import { integer } from 'neo4j-driver';


@Injectable()
export class CompanyService {
  constructor(
    private capabilitiesTreeSrv:  CapabilityTreeService,
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @InjectRepository(IndustryTree) private readonly industryTreeRepository: Repository<IndustryTree>,
    @InjectRepository(CapabilityTree) private readonly capabilityTreeRepositoryTest: Repository<CapabilityTree>,
    @InjectRepository(Capability) private readonly capabilityTreeRepository: TreeRepository<Capability>,
    @InjectRepository(Capability) private readonly capabilityRepository: Repository<Capability>,
  ) {}

  async findAll(query: CompaniesArgs): Promise<Company[]> {
    const options = this.getFindAllQuery(query);
    // options.relations = ['industry_trees'];
    return this.companyRepository.find(options);
  }

  findOneById(id: number): Promise<Company> {
    return this.getOneByIdWithIndustryTrees(id)
  }

  async countDocuments(query: CompaniesArgs): Promise<number> {
    return this.companyRepository.count(query);
  }

 async recursiveFunction(collection){ 
    each(collection, (model) => { 
        console.log(model); 
        // const cap =
        if(model.pages.length > 0){ 
            this.recursiveFunction(model.pages); 
        }
    }); 
  };

  async create(data: CompanyCreationInput, context?: any): Promise<Company> {
    console.log("CompanyService -> data", data);
    const { user } = context;
    const { industry_id } = data;
    const industry = await this.industryTreeRepository.findOne(industry_id)

    console.log(industry,"industry")
    let company = new Company(data);
    company.user = user;
    company.industry = industry;
    company = await this.companyRepository.save(company);
    console.log(company,"company")
    const rootcompany = await this.capabilitiesTreeSrv.capabilityTreeRepository.save({ cap_name: data.name, type: "company",company_id: company.id, parentId: null })

    // if(industry.capability_trees) {
      const rootChildren = await this.capabilitiesTreeSrv.getAllChildrenOfIndustry(industry_id);
      console.log(rootChildren,"rootChildren")
      const rootindustryid = rootChildren[0].id
      rootChildren.shift()
      const oldCapToNewCapIDs = {};


      await asyncForEach(rootChildren, async ({ id,cap_name, capability_lib_id ,parentId, capability, tags }) => {
        const newCap = new CapabilityTree({ cap_name, parentId, capability_lib_id, type: 'company', company_id: company.id, tags})
        if(parentId === rootindustryid) {
          newCap.parentId = rootcompany.id
        } else {
          newCap.parentId = oldCapToNewCapIDs[parentId]
        }
        const cap = await this.capabilitiesTreeSrv.collectEntityFields(newCap)
        if(capability){
          cap.capability =  await this.capabilityRepository.save(new Capability({
            name: cap.cap_name,
            kpis: capability.kpis
          }))
        }
        const createdCapability = await this.capabilitiesTreeSrv.capabilityTreeRepository.save(cap) 
        oldCapToNewCapIDs[id] = createdCapability.id
      });
    // }
    
    return this.companyRepository.findOne();
  }

  async clone(id: number, data: CompanyInput, context?: any): Promise<Company> {
    const originalCompany = await this.companyRepository.findOne(id);
    return await this.create(
      {
        name: data.name,
        // industry_id: originalCompany.industry_id,
        industry_id: originalCompany.industry.id,
      },
      context
    );
  }

  async save(id: number, data: CompanyInput): Promise<Company> {
    const company = new Company(data);
    company.id = id;
    company
  
    await this.companyRepository.save(company);
    return this.getOneByIdWithIndustryTrees(id);
  }

  async saveMany(input: CompanyInput[], context?: any) {
    const { user } = context;
    const data = input.map(candidate => {
      let company = new Company({ ...candidate });
      company.user = user;
      return company;
    });
    await this.companyRepository.save(data);
    return await this.companyRepository.findByIds(data.map(p => p.id));
  }

  async remove(id: number) {  
    const caps = await this.capabilityTreeRepositoryTest.find({ company_id: id});
    await this.capabilityTreeRepositoryTest.remove(caps)
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

  async getOneByIdWithIndustryTrees(id: number): Promise<Company> {
    const company = await this.companyRepository
      .createQueryBuilder('company')
      .where('company.id = :id', { id })
      .leftJoinAndSelect('company.industry', 'industry')
      .getOne();
    if (!company) {
      throw new NotFoundException();
    }
    return company;
  }
}
