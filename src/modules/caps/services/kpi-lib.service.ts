import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';

import { KpiLib } from '../entities';
import { KpiLibCreationInput, KpiLibInput, KpiLibsArgs } from '../dto';

@Injectable()
export class KpiLibService {
  constructor(@InjectRepository(KpiLib) private readonly kpilibRepository: Repository<KpiLib>) {}

  async findAll(args: KpiLibsArgs): Promise<KpiLib[]> {
    return await this.kpilibRepository.find(this.getFindAllQuery(args));
  }

  async findAllPagination(args: KpiLibsArgs): Promise<[KpiLib[], number]> {
    return await this.kpilibRepository.findAndCount(this.getFindAllQuery(args));
  }

  async findOneById(id: number): Promise<KpiLib> {
    return this.kpilibRepository.findOne(id);
  }

  async count(args: KpiLibsArgs) {
    const count = await this.kpilibRepository.count({ where: args });
    return { total: count };
  }

  async create(data: KpiLibCreationInput): Promise<KpiLib> {
    return await this.kpilibRepository.save(this.kpilibRepository.create(data));
  }

  async save(id: number, data: KpiLibInput): Promise<KpiLib> {
    return this.kpilibRepository.save(data);
  }

  async saveMany(data: KpiLibInput[]) {
    await this.kpilibRepository.save(data);
    return await this.kpilibRepository.findByIds(data.map(kl => kl.id));
  }

  async remove(id: number) {
    await this.kpilibRepository.delete(id);
    return { id };
  }

  getFindAllQuery(query: KpiLibsArgs): FindManyOptions {
    const { page, skip, limit, ...where } = query;
    return {
      skip: skip > 0 ? skip : (page - 1) * limit,
      take: limit,
      where,
    };
  }
}
