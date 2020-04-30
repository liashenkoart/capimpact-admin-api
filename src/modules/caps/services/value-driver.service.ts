import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';

import { sortTreeByField } from '@lib/sorting';
import { BaseService } from 'modules/common/services';

import { Industry, ValueDriver } from '../entities';
import { ValueDriverCreationInput, ValueDriverInput, ValueDriversArgs } from '../dto';

@Injectable()
export class ValueDriverService extends BaseService {
  constructor(
    @InjectRepository(ValueDriver) private readonly valueDriverRepository: Repository<ValueDriver>,
    @InjectRepository(ValueDriver) private readonly treeRepository: TreeRepository<ValueDriver>,
    @InjectRepository(Industry) private readonly industryRepository: Repository<Industry>
  ) {
    super();
  }

  async tree(query: ValueDriversArgs): Promise<ValueDriver> {
    const { industryId, companyId } = query;
    let root = null;
    if (industryId) {
      root = await this.valueDriverRepository.findOne({ industryId, parentId: null });
    } else if (companyId) {
      root = await this.valueDriverRepository.findOne({ companyId, parentId: null });
    }
    if (!root) {
      const industry = await this.industryRepository.findOne(industryId);
      if (industry) {
        root = await this.create({
          name: industry.name,
          industryId: industry.id,
          parentId: null,
        });
      }
    }
    if (!root) {
      throw new NotFoundException();
    }
    const tree = await this.treeRepository.findDescendantsTree(root);
    return sortTreeByField('name', tree);
  }

  async findAll(args: ValueDriversArgs): Promise<ValueDriver[]> {
    return await this.valueDriverRepository.find(this.getFindAllQuery(args));
  }

  async findAllPagination(args: ValueDriversArgs): Promise<[ValueDriver[], number]> {
    return await this.valueDriverRepository.findAndCount(this.getFindAllQuery(args));
  }

  async findOneById(id: number): Promise<ValueDriver> {
    return this.valueDriverRepository.findOne({ id });
  }

  async count(args: ValueDriversArgs) {
    const count = await this.valueDriverRepository.count({ where: args });
    return { total: count };
  }

  async create(data: ValueDriverCreationInput): Promise<ValueDriver> {
    data.parent = await this.findOneById(data.parentId);
    return await this.valueDriverRepository.save(this.valueDriverRepository.create(data));
  }

  async save(id: number, data: ValueDriverInput): Promise<ValueDriver> {
    return this.valueDriverRepository.save(data);
  }

  async saveMany(data: ValueDriverInput[]) {
    await this.valueDriverRepository.save(data);
    return await this.valueDriverRepository.findByIds(data.map(kl => kl.id));
  }

  async cloneTreeFromIndustry(id: any, industry: Industry, context?: any): Promise<ValueDriver> {
    const { user } = context;
    const industryId = parseInt(id, 10); // cloned industry id
    let node = null;
    // save root industry node
    let root = await this.valueDriverRepository.save({
      name: industry.name,
      default: true,
      industry,
      parent: null,
      user,
    });
    let clonedRoot = await this.valueDriverRepository.findOne({ industryId, parentId: null });
    let descendants = await this.treeRepository.findDescendants(clonedRoot);
    let groupByName = {};
    for (let descendant of descendants) {
      if (descendant.parentId) {
        const parentNode = descendants.find(it => it.id === descendant.parentId);
        const parent = (parentNode && groupByName[parentNode.id]) || root;
        node = await this.valueDriverRepository.save({
          name: descendant.name,
          default: true,
          industryId: industry.id,
          parent,
          user,
        });
        groupByName[descendant.id] = node;
      }
    }
    return this.tree({ industryId: industry.id });
  }

  async remove(id: number) {
    await this.valueDriverRepository.delete(id);
    return { id };
  }

  async removeByIndustry(industryId: any) {
    return this.valueDriverRepository.delete({ industryId: +industryId });
  }
}
