import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';

import { CapabilityLib, KpiLib } from '../entities';
import { CapabilityLibsArgs, CapabilityLibCreationInput, CapabilityLibInput } from '../dto';

@Injectable()
export class CapabilityLibService {
  constructor(
    @InjectRepository(KpiLib) private readonly kpiLibRepository: Repository<KpiLib>,
    @InjectRepository(CapabilityLib) private readonly capabilityLibRepository: Repository<CapabilityLib>,
  ) {}

  async findAll(query: CapabilityLibsArgs): Promise<CapabilityLib[] | void> {
    const options = this.getFindAllQuery(query);
    options.relations = ['kpi_libs'];
    return this.capabilityLibRepository.find(options);
  }

  async findOneById(id: number): Promise<CapabilityLib> {
    return this.getOneByIdWithKpiLibs(id);
  }

  async create(data: CapabilityLibCreationInput): Promise<CapabilityLib> {
    data.kpi_libs = data.kpi_libs ? await this.kpiLibRepository.findByIds(data.kpi_libs) : [];
    return await this.capabilityLibRepository.save(new CapabilityLib(data));
  }

  async save(id: number, data: CapabilityLibInput): Promise<CapabilityLib> {
    const { kpi_libs } = await this.getOneByIdWithKpiLibs(id);
    const kpi_lib_ids = kpi_libs.map(({ id }) => id);
    let newKpiLibs = [];
    if (data.kpi_libs) {
      newKpiLibs = (await this.kpiLibRepository.findByIds(data.kpi_libs))
        .filter(({ id }) => !kpi_lib_ids.includes(id));
    }
    data.id = id;
    data.kpi_libs = [...kpi_libs, ...newKpiLibs];
    return this.capabilityLibRepository.save(new CapabilityLib(data));
  }

  async remove(id: number) {
    const capabilityLib = await this.getOneById(id);
    await this.capabilityLibRepository.remove(capabilityLib);
    return { id };
  }

  async removeKpiLib(id: number, kpi_lib_id: number) {
    const capabilityLib = await this.getOneByIdWithKpiLibs(id);
    capabilityLib.kpi_libs = capabilityLib.kpi_libs.filter(item => item.id !== kpi_lib_id);
    return this.capabilityLibRepository.save(capabilityLib);
  }

  getFindAllQuery(query: CapabilityLibsArgs): FindManyOptions {
    const { page, skip, limit, ...where } = query;
    return {
      skip: (page - 1) * limit,
      take: limit,
      where,
    };
  }

  async getOneById(id: number): Promise<CapabilityLib> {
    const capabilityLib = await this.capabilityLibRepository.findOne({ id });
    if (!capabilityLib) {
      throw new NotFoundException();
    }
    return capabilityLib
  }
  async getOneByIdWithKpiLibs(id: number): Promise<CapabilityLib> {
    const capabilityLib = await this.capabilityLibRepository
      .createQueryBuilder('capabilityLib')
      .where('capabilityLib.id = :id', { id })
      .leftJoinAndSelect('capabilityLib.kpi_libs', 'kpi_libs')
      .getOne();
    if (!capabilityLib) {
      throw new NotFoundException();
    }
    return capabilityLib;
  }
}