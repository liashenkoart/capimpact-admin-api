import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from 'modules/common/services';

import {CapabilityLib, KpiLib} from '../entities';
import { KpiLibCreationInput, KpiLibInput, KpiLibsArgs } from '../dto';

@Injectable()
export class KpiLibService extends BaseService {
  constructor(
    @InjectRepository(KpiLib) private readonly kpilibRepository: Repository<KpiLib>,
    @InjectRepository(CapabilityLib) private readonly capabilityLibRepository: Repository<CapabilityLib>
  ) {
    super();
  }

  async findAll(args: KpiLibsArgs): Promise<KpiLib[]> {
    const options = this.getFindAllQuery(args);
    options.relations = ['capabilityLibs'];
    return await this.kpilibRepository.find(options);
  }

  async findAllPagination(args: KpiLibsArgs): Promise<[KpiLib[], number]> {
    return await this.kpilibRepository.findAndCount(this.getFindAllQuery(args));
  }

  async findOneById(id: number): Promise<KpiLib> {
    return this.kpilibRepository
      .createQueryBuilder('kpiLib')
      .where('kpiLib.id = :id', { id })
      .leftJoinAndSelect('kpiLib.capabilityLibs', 'capabilityLibs')
      .getOne();
  }

  async count(args: KpiLibsArgs) {
    const count = await this.kpilibRepository.count({ where: args });
    return { total: count };
  }

  async create(data: KpiLibCreationInput): Promise<KpiLib> {
    data.capabilityLibs = data.capabilityLibs ? await this.capabilityLibRepository.findByIds(data.capabilityLibs) : [];
    return await this.kpilibRepository.save(this.kpilibRepository.create(data));
  }

  async save(id: number, data: KpiLibInput): Promise<KpiLib> {
    data.capabilityLibs = data.capabilityLibs ? await this.capabilityLibRepository.findByIds(data.capabilityLibs) : [];
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
}
