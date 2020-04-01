import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';

import { BaseService } from 'modules/common/services';

import { ValueDriver } from '../entities';
import { ValueDriverCreationInput, ValueDriverInput, ValueDriversArgs } from '../dto';

@Injectable()
export class ValueDriverService extends BaseService {
  constructor(
    @InjectRepository(ValueDriver) private readonly valueDriverRepository: Repository<ValueDriver>,
    @InjectRepository(ValueDriver) private readonly treeRepository: TreeRepository<ValueDriver>
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
      throw new NotFoundException();
    }
    return this.treeRepository.findDescendantsTree(root);
  }

  async findAll(args: ValueDriversArgs): Promise<ValueDriver[]> {
    return await this.valueDriverRepository.find(this.getFindAllQuery(args));
  }

  async findAllPagination(args: ValueDriversArgs): Promise<[ValueDriver[], number]> {
    return await this.valueDriverRepository.findAndCount(this.getFindAllQuery(args));
  }

  async findOneById(id: number): Promise<ValueDriver> {
    return this.valueDriverRepository.findOne(id);
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

  async remove(id: number) {
    await this.valueDriverRepository.delete(id);
    return { id };
  }
}
