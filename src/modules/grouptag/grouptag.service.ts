import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from 'modules/common/services';
import { GroupTag } from './group-tag.entity';
import { Capability } from '../capability/capability.entity';
import { GroupTagCreationInput, GroupTagInput, GroupTagsArgs } from './dto';

@Injectable()
export class GroupTagService extends BaseService {
  constructor(
    @InjectRepository(Capability) private readonly capabilityRepository: Repository<Capability>,
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
    const group = await this.findOneById(id);
    if (group) {
      const caps = await this.capabilityRepository.find({ where: { company_id: group.companyId } });
      for (let cap of caps) {
        if (cap.tags && cap.tags[`${group.id}_${group.name}`]) {
          delete cap.tags[`${group.id}_${group.name}`];
          await this.capabilityRepository.save(cap);
        }
      }
    }
    await this.groupTagRepository.delete(id);
    return { id };
  }
}
