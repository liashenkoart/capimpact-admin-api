import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, FindManyOptions } from 'typeorm';

import { Company, Capability, IndustryTree } from '../entities';
import { CompanyCreationInput, CompanyInput, CompaniesArgs } from '../dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @InjectRepository(IndustryTree) private readonly industryTreeRepository: Repository<IndustryTree>,
    @InjectRepository(Capability) private readonly capabilityTreeRepository: TreeRepository<Capability>,
    @InjectRepository(Capability) private readonly capabilityRepository: Repository<Capability>,
  ) {}

  async findAll(query: CompaniesArgs): Promise<Company[]> {
    const options = this.getFindAllQuery(query);
    options.relations = ['industry_trees'];
    return this.companyRepository.find(options);
  }

  findOneById(id: number): Promise<Company> {
    return this.getOneByIdWithIndustryTrees(id)
  }

  async countDocuments(query: CompaniesArgs): Promise<number> {
    return this.companyRepository.count(query);
  }

  async create(data: CompanyCreationInput, context?: any): Promise<Company> {
  console.log("CompanyService -> data", data)
    const { user } = context;
    let company = new Company(data);
    company.user = user;
    if (data.industry_trees) {
      company.industry_trees = await this.industryTreeRepository.findByIds(data.industry_trees);
    }
    company = await this.companyRepository.save(company);

    // Copy caps from industry tree
    let root = await this.capabilityRepository.findOne({
      industry_id: company.industry.id,
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
      original_id: root.id,
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
          original_id: descendant.id,
          parent,
          user,
        });
        nodes[descendant.id] = node;
      }
    }
    return company;
  }

  async clone(id: number, data: CompanyInput, context?: any): Promise<Company> {
    const originalCompany = await this.companyRepository.findOne(id);
    return await this.create(
      {
        name: data.name,
        industry_id: originalCompany.industry.id,
      },
      context
    );
  }

  async save(id: number, data: CompanyInput): Promise<Company> {
    const company = new Company(data);
    company.id = id;
    const { industry_trees } = await this.getOneByIdWithIndustryTrees(id);
    const industry_trees_ids = industry_trees.map(({ id }) => id);
    let newIndustryTrees = [];
    if (data.industry_trees) {
      newIndustryTrees = (await this.industryTreeRepository.findByIds(data.industry_trees))
        .filter(({ id }) => !industry_trees_ids.includes(id));
    }
    company.industry_trees = [...industry_trees, ...newIndustryTrees];
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
    await this.capabilityRepository.delete({ company_id: id });
    await this.companyRepository.delete(id);
    return { id };
  }

  async removeIndustryTree(id: number, industry_tree_id: number) {
    const company = await this.getOneByIdWithIndustryTrees(id);
    company.industry_trees = company.industry_trees.filter(item => item.id !== industry_tree_id);
    return this.companyRepository.save(company);
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
      .leftJoinAndSelect('company.industry_trees', 'industry_trees')
      .getOne();
    if (!company) {
      throw new NotFoundException();
    }
    return company;
  }
}
