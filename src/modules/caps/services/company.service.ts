import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, FindManyOptions } from 'typeorm';

import { Company, Capability } from '../entities';
import { CompanyCreationInput, CompanyInput, CompaniesArgs } from '../dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @InjectRepository(Capability)
    private readonly capabilityTreeRepository: TreeRepository<Capability>,
    @InjectRepository(Capability) private readonly capabilityRepository: Repository<Capability>
  ) {}

  async findAll(query: CompaniesArgs): Promise<Company[]> {
    const options = this.getFindAllQuery(query);
    let result = await this.companyRepository.find(options);
    return result;
  }

  async findOneById(id: number): Promise<Company> {
    return this.companyRepository.findOne(id);
  }

  async countDocuments(query: CompaniesArgs): Promise<number> {
    return this.companyRepository.count(query);
  }

  async create(data: CompanyCreationInput, context?: any): Promise<Company> {
    const { user } = context;
    let company = new Company(data);
    company.user = user;
    company = await this.companyRepository.save(company);

    // Copy caps from industry tree
    let root = await this.capabilityRepository.findOne({
      industry_id: company.industry_id,
      parentId: null,
    });
    const tree = await this.capabilityTreeRepository.findDescendantsTree(root);
    let descendants = tree.children.reduce((prev, cap) => {
      return prev.concat(
        [{ id: cap.id, name: cap.name, parentId: cap.parentId }],
        cap.children.map(child => ({ id: child.id, name: child.name, parentId: child.parentId }))
      );
    }, []);
    root = await this.capabilityRepository.save({
      name: company.name,
      company,
      parent: null,
      user,
    });
    let nodes = {};
    let node = null;
    for (let descendant of descendants) {
      if (descendant.parentId) {
        const parentNode = descendants.find(it => it.id === descendant.parentId);
        const parent = (parentNode && nodes[parentNode.id]) || root;
        node = await this.capabilityRepository.save({
          name: descendant.name,
          company,
          parent,
          user,
        });
        nodes[descendant.id] = node;
      }
    }
    return company;
  }

  async clone(id: number, data: CompanyInput, context?: any): Promise<Company> {
    let originalCompany = await this.companyRepository.findOne(id);
    let company = await this.create(
      {
        name: data.name,
        industry_id: originalCompany.industry_id,
      },
      context
    );
    return company;
  }

  async save(id: any, data: CompanyInput): Promise<Company> {
    const company = new Company({ ...data });
    company.id = parseInt(id, 10);
    return this.companyRepository.save(company);
  }

  async saveMany(input: CompanyInput[], context?: any) {
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
