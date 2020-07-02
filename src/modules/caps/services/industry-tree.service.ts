import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';

import { BaseService } from '@modules/common/services';
import { IndustryTree, Company } from '../entities';
import { IndustryTreesArgs, IndustryTreeCreationInput, IndustryTreeInput } from '../dto';
import { sortTreeByField } from "@lib/sorting";

@Injectable()
export class IndustryTreeService extends BaseService {
  constructor(
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @InjectRepository(IndustryTree) private readonly industryTreeRepository: Repository<IndustryTree>,
    @InjectRepository(IndustryTree) private readonly treeRepository: TreeRepository<IndustryTree>
  ) {
    super();
  }

  async findAll(query: IndustryTreesArgs): Promise<IndustryTree[] | void> {
    const options = this.getFindAllQuery(query);
    options.relations = ['companies'];
    return this.industryTreeRepository.find(options);
  }

  findOneById(id: number): Promise<IndustryTree> {
    return this.getOneByIdWithCompanies(id);
  }

  async create(data: IndustryTreeCreationInput): Promise<IndustryTree> {
    const industryTree = await this.collectEntityFields(new IndustryTree(data));
    return this.industryTreeRepository.save(industryTree);
  }

  async save(id: number, data: IndustryTreeInput): Promise<IndustryTree> {
    data.id = id;
    const industryTree = await this.collectEntityFields(new IndustryTree(data));
    const { companies } = await this.getOneByIdWithCompanies(id);
    const companies_ids = companies.map(({ id }) => id);
    let newCompanies = [];
    if (data.companies) {
      newCompanies = (await this.companyRepository.findByIds(data.companies))
        .filter(({ id }) => !companies_ids.includes(id));
    }
    industryTree.companies = [...companies, ...newCompanies];
    await this.industryTreeRepository.save(industryTree);
    return this.getOneByIdWithCompanies(id);
  }

  async remove(id: number) {
    const node = await this.industryTreeRepository.findOne({ id });
    if (node) {
      await this.industryTreeRepository.remove(node);
    }
    return { id };
  }

  async removeCompany(id: number, company_id: number) {
    const industryTree = await this.getOneByIdWithCompanies(id);
    industryTree.companies = industryTree.companies.filter(item => item.id !== company_id);
    return this.industryTreeRepository.save(industryTree);
  }

  async tree(query: IndustryTreesArgs): Promise<IndustryTree[] | void> {
    const roots = await this.industryTreeRepository.find({ where: { parentId: null } });
    const treeArray = await Promise.all(roots.map(root => this.getTreeForNode(root)));
    return treeArray.sort((a, b) => a.code.localeCompare(b.code, 'en', { numeric: true }))
      .map(tree => sortTreeByField('code', tree));
  }

  async treeByCode(code: string) {
    const node = await this.industryTreeRepository.findOne({ code });
    return this.getTreeForNode(node);
  }

  async collectEntityFields(industryTree: IndustryTree): Promise<IndustryTree> {
    const { parentId, companies } = industryTree;
    if (parentId) {
      industryTree.parent = await this.findOneById(parentId);
    }
    if (companies) {
      industryTree.companies = await this.companyRepository.findByIds(companies);
    }
    return industryTree;
  }

  async getTreeForNode(node: IndustryTree): Promise<IndustryTree> {
    if (!node) {
      throw new NotFoundException();
    }
    const tree = await this.treeRepository.findDescendantsTree(node);
    return sortTreeByField('name', tree);
  }

  async getOneByIdWithCompanies(id: number): Promise<IndustryTree> {
    const industryTree = await this.industryTreeRepository
      .createQueryBuilder('industryTree')
      .where('industryTree.id = :id', { id })
      .leftJoinAndSelect('industryTree.companies', 'companies')
      .getOne();
    if (!industryTree) {
      throw new NotFoundException();
    }
    return industryTree;
  }
}
