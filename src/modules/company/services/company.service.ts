import { Injectable, forwardRef, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, FindManyOptions, Raw } from 'typeorm';
import { CompanyCreationInput, CompanyInput, CompaniesArgs } from '../dto';
import { asyncForEach } from '@lib/sorting';
import { CapabilityTreeService } from '../../capability-tree/capability-tree.service';
import { each } from 'lodash';

import { Company } from '../company.entity';
import { Capability } from '../../capability/capability.entity';
import { IndustryTree } from '../../industry-tree/industry-tree.entity';
import { CapabilityTree } from '../../capability-tree/capability-tree.entity';
import { Challenge } from '../../challenge/challenge.entity';
import { GroupTag } from '../../grouptag/group-tag.entity';

@Injectable()
export class CompanyService {
  constructor(
    @Inject(forwardRef(() => CapabilityTreeService))
    private capabilitiesTreeSrv:  CapabilityTreeService,
    @InjectRepository(GroupTag) private readonly groupTagRepository: Repository<GroupTag>,
    @InjectRepository(Challenge) private readonly challengeRepository: Repository<Challenge>,
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @InjectRepository(IndustryTree) private readonly industryTreeRepository: Repository<IndustryTree>,
    @InjectRepository(CapabilityTree) private readonly capabilityTreeRepositoryTest: Repository<CapabilityTree>,
    @InjectRepository(Capability) private readonly capabilityTreeRepository: TreeRepository<Capability>,
    @InjectRepository(Capability) private readonly capabilityRepository: Repository<Capability>,
  ) {}

  async findAll(query: CompaniesArgs): Promise<Company[]> {
    const options: any = this.getFindAllQuery(query);

    const { take = null, skip = 0, search = '' } = options;

    let orderBy = 'companies.name';
    let ordertType = 'ASC';
    if(options.sort) {
      orderBy = options.sort[0];
      ordertType = options.sort[1] as any;
    }

    let companiesQuery = this.companyRepository.createQueryBuilder('companies')
    .leftJoinAndSelect('companies.industry', 'industry')
    .orderBy(orderBy , ordertType as 'ASC' | 'DESC')
    .where("companies.name ILIKE :name", { name: `%${search}%` })
    .orWhere("industry.name ILIKE :name", { name: `%${search}%` })

    if(take)
      companiesQuery.take(take)
    if(skip)
      companiesQuery.skip(skip)

    return companiesQuery.getMany();
  }

  findOneById(id: number): Promise<Company> {
    return this.getOneByIdWithIndustryTrees(id)
  }

  async countDocuments(query: CompaniesArgs): Promise<number> {
    return this.companyRepository.count(query);
  }

 async recursiveFunction(collection){ 
    each(collection, (model) => { 
        if(model.pages.length > 0){ 
            this.recursiveFunction(model.pages); 
        }
    }); 
  };

  async create(data: CompanyCreationInput, context?: any, res?: any): Promise<Company> {
    console.log("CompanyService -> data", data);
    const { user } = context;
    const { industry_id, name } = data;
    const industry = await this.industryTreeRepository.findOne(industry_id)

    let company = new Company(data);
    company.user = user;
    company.industry = industry;
    company = await this.companyRepository.save(company);

     const rootChildren = await this.capabilitiesTreeSrv.getAllChildrenOfIndustry(industry_id);

       await this.createEntity(rootChildren, company,name, res); 
    
    return this.companyRepository.findOne();
  }

  async createEntity(rootChildren:CapabilityTree[], company: Company,cap_name: string, res?) {
    let count = 0;
    
    const rootcompany = await this.capabilitiesTreeSrv.capabilityTreeRepository.save({ cap_name, type: "company",company_id: company.id, parentId: null });
   if(rootChildren.length > 0 ) {
    const rootindustryid = rootChildren[0].id;
    const clonedNodeId = rootChildren[0].id;
    rootChildren.shift();
    const oldCapToNewCapIDs = {}; 


    await asyncForEach(rootChildren, async ({ id,cap_name, capability_lib_id ,parentId, capability, tags }) => {
      count++;
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
 
      if(count === 1) {
       await  res.status(200).send({ 
         newNodeId: rootcompany.id, 
         clonedNodeId,
         clone: true
        });
      }
      oldCapToNewCapIDs[id] = createdCapability.id
    });
  } else {
    await  res.status(200).send({ 
      clone: false
     });
  }
  }

  async clone(clonedId: number, data: CompanyInput, context?: any, res?: any): Promise<void> {
    const { user } = context;
    const { name } = data;
    const originalCompany = await this.companyRepository.findOne(clonedId);
    const { id, ...rest } = originalCompany;
    let company = new Company({ ...rest, name, user });
    company = await this.companyRepository.save(company);
    const rootChildren = await this.capabilitiesTreeSrv.getAllChildrenbyCompanyId(clonedId);

    await this.createEntity(rootChildren,company,name,res);
  }

  async save(id: number, data: CompanyInput): Promise<Company> {
    const company = new Company(data);
    company.id = id;
    await this.companyRepository.save(company);
    return this.getOneByIdWithIndustryTrees(id);
  }

  async saveMany(input: CompanyInput[], context?: any): Promise<Company[]> {
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
   const [caps,  challenges, groupTags]  = 
   await Promise.all([this.capabilityTreeRepositoryTest.find({ company_id: id}),
                      this.challengeRepository.find({ companyId: id}),
                      this.groupTagRepository.find({ companyId: id})])

   await Promise.all([this.groupTagRepository.remove(groupTags),
                      this.challengeRepository.remove(challenges),
                      this.capabilityTreeRepositoryTest.remove(caps),
                      this.companyRepository.delete(id)])                                         
   
    return { id };
  }

  getFindAllQuery(query): FindManyOptions {
    const { sort } = query;
    
    if( sort ) {
      const [prop, value] = sort;
      if(!prop.includes('.')) {
        query.sort = [`${'companies.' + prop}`, value]
      }
    }
    const { skip, limit, ...where } = query;
    return {
      skip,
      take: limit,
      ...where
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
