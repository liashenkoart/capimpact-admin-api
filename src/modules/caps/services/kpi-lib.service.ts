import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from 'modules/common/services';

import { CapabilityLib, KpiLib } from '../entities';
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
    options.relations = ['capability_libs'];
    return await this.kpilibRepository.find(options);
  }

  async findAllPagination(args: KpiLibsArgs): Promise<[KpiLib[], number]> {
    return await this.kpilibRepository.findAndCount(this.getFindAllQuery(args));
  }

  async findOneById(id: number): Promise<KpiLib> {
    return this.getOneByIdWithCapabilityLibs(id);
  }

  async count(args: KpiLibsArgs) {
    const count = await this.kpilibRepository.count({ where: args });
    return { total: count };
  }

  async create(data: KpiLibCreationInput): Promise<KpiLib> {
    data.capability_libs = data.capability_libs
      ? await this.capabilityLibRepository.findByIds(data.capability_libs) : [];
    return await this.kpilibRepository.save(this.kpilibRepository.create(data));
  }

  async save(id: number, data: KpiLibInput): Promise<KpiLib> {
    const { capability_libs } = await this.getOneByIdWithCapabilityLibs(id);
    const capability_lib_ids = capability_libs.map(({ id }) => id);
    let newCapabilityLibs = [];
    if (data.capability_libs) {
      newCapabilityLibs = (await this.capabilityLibRepository.findByIds(data.capability_libs))
        .filter(({ id }) => !capability_lib_ids.includes(id));
    }
    data.id = id;
    data.capability_libs = [...capability_libs, ...newCapabilityLibs];
    return this.kpilibRepository.save(new KpiLib(data));
  }

  async saveMany(data: KpiLibInput[]) {
    await this.kpilibRepository.save(data);
    return await this.kpilibRepository.findByIds(data.map(kl => kl.id));
  }

  async removeCapabilityLib(id: number, capability_lib_id: number) {
    const kpiLib = await this.getOneByIdWithCapabilityLibs(id);
    kpiLib.capability_libs = kpiLib.capability_libs.filter(item => item.id !== capability_lib_id);
    return this.kpilibRepository.save(kpiLib);
  }

  async remove(id: number) {
    await this.kpilibRepository.delete(id);
    return { id };
  }

  async getOneByIdWithCapabilityLibs(id: number): Promise<KpiLib> {
    const kpiLib = await this.kpilibRepository
      .createQueryBuilder('kpiLib')
      .where('kpiLib.id = :id', { id })
      .leftJoinAndSelect('kpiLib.capability_libs', 'capability_libs')
      .getOne();
    if (!kpiLib) {
      throw new NotFoundException();
    }
    return kpiLib;
  }
}
