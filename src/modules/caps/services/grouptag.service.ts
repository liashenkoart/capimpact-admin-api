import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from 'modules/common/services';

import { GroupTag } from '../entities';
import { GroupTagCreationInput, GroupTagInput, GroupTagsArgs } from '../dto';

@Injectable()
export class GroupTagService extends BaseService {
  constructor(
    @InjectRepository(GroupTag) private readonly groupTagRepository: Repository<GroupTag>
  ) {
    super();
  }

  async findAll(args: GroupTagsArgs): Promise<GroupTag[]> {
    return await this.groupTagRepository.find(this.getFindAllQuery(args));
  }

  async findAllPagination(args: GroupTagsArgs): Promise<[GroupTag[], number]> {
    return await this.groupTagRepository.findAndCount(this.getFindAllQuery(args));
  }

  async findOneById(id: number): Promise<GroupTag> {
    return this.groupTagRepository.findOne(id);
  }

  async count(args: GroupTagsArgs) {
    const count = await this.groupTagRepository.count({ where: args });
    return { total: count };
  }

  async create(data: GroupTagCreationInput): Promise<GroupTag> {
    return await this.groupTagRepository.save(this.groupTagRepository.create(data));
  }

  async save(data: GroupTagInput): Promise<GroupTag> {
    return this.groupTagRepository.save(data);
  }

  async saveMany(data: GroupTagInput[]) {
    await this.groupTagRepository.save(data);
    return await this.groupTagRepository.findByIds(data.map(kl => kl.id));
  }

  async remove(id: number) {
    await this.groupTagRepository.delete(id);
    return { id };
  }
}
