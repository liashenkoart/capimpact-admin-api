import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from 'modules/common/services';

import { GroupFilter, Capability } from '../entities';
import { GroupFilterCreationInput, GroupFilterInput, GroupFiltersArgs } from '../dto';

@Injectable()
export class GroupFilterService extends BaseService {
  constructor(
    @InjectRepository(Capability) private readonly capabilityRepository: Repository<Capability>,
    @InjectRepository(GroupFilter) private readonly groupFilterRepository: Repository<GroupFilter>
  ) {
    super();
  }

  async findAll(args: GroupFiltersArgs): Promise<GroupFilter[]> {
    return await this.groupFilterRepository.find(this.getFindAllQuery(args));
  }

  async findAllPagination(args: GroupFiltersArgs): Promise<[GroupFilter[], number]> {
    return await this.groupFilterRepository.findAndCount(this.getFindAllQuery(args));
  }

  async findOneById(id: number): Promise<GroupFilter> {
    return this.groupFilterRepository.findOne(id);
  }

  async count(args: GroupFiltersArgs) {
    const count = await this.groupFilterRepository.count({ where: args });
    return { total: count };
  }

  async create(data: GroupFilterCreationInput): Promise<GroupFilter> {
    return await this.groupFilterRepository.save(this.groupFilterRepository.create(data));
  }

  async save(data: GroupFilterInput): Promise<GroupFilter> {
    return this.groupFilterRepository.save(data);
  }

  async saveMany(data: GroupFilterInput[]) {
    await this.groupFilterRepository.save(data);
    return await this.groupFilterRepository.findByIds(data.map(kl => kl.id));
  }

  async remove(id: number) {
    const group = await this.findOneById(id);
    if (group) {
      await this.groupFilterRepository.delete({ parentId: group.id });
      const caps = await this.capabilityRepository.find({ where: { company_id: group.companyId } });
      for (let cap of caps) {
        if (cap.filters && cap.filters[`${group.id}_${group.name}`]) {
          delete cap.filters[`${group.id}_${group.name}`];
          await this.capabilityRepository.save(cap);
        }
      }
    }
    await this.groupFilterRepository.delete(id);
    return { id };
  }
}
