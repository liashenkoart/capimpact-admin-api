import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';

import { BaseService } from '@modules/common/services';
import { IndustryTree } from '../entities';
import { IndustryTreesArgs, IndustryTreeCreationInput, IndustryTreeInput } from '../dto';
import { sortTreeByField } from "@lib/sorting";

@Injectable()
export class IndustryTreeService extends BaseService {
  constructor(
    @InjectRepository(IndustryTree) private readonly industryTreeRepository: Repository<IndustryTree>,
    @InjectRepository(IndustryTree) private readonly treeRepository: TreeRepository<IndustryTree>
  ) {
    super();
  }

  async findAll(query: IndustryTreesArgs): Promise<IndustryTree[] | void> {
    return this.industryTreeRepository.find(this.getFindAllQuery(query));
  }

  async findOneById(id: number): Promise<IndustryTree> {
    return this.industryTreeRepository.findOne({ id });
  }

  async create(data: IndustryTreeCreationInput): Promise<IndustryTree> {
    const industryTree = await this.collectEntityFields(new IndustryTree(data));
    return this.industryTreeRepository.save(industryTree);
  }

  async save(id: number, data: IndustryTreeInput): Promise<IndustryTree> {
    data.id = id;
    const industryTree = await this.collectEntityFields(new IndustryTree(data));
    return this.industryTreeRepository.save(industryTree);
  }

  async remove(id: number) {
    const node = await this.industryTreeRepository.findOne({ id });
    if (node) {
      await this.industryTreeRepository.remove(node);
    }
    return { id };
  }

  async tree(query: IndustryTreesArgs): Promise<IndustryTree[] | void> {
    const roots = await this.industryTreeRepository.find({ where: { parentId: null } });
    return Promise.all(roots.map(root => this.getTreeForNode(root)));
  }

  async treeByCode(code: string) {
    const node = await this.industryTreeRepository.findOne({ code });
    return this.getTreeForNode(node);
  }

  async collectEntityFields(industryTree: IndustryTree): Promise<IndustryTree> {
    if (industryTree.parentId) {
      industryTree.parent = await this.findOneById(industryTree.parentId);
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
}
