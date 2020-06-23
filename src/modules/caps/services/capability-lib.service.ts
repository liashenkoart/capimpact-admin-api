import { Injectable } from '@nestjs/common';
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
    return this.capabilityLibRepository
      .createQueryBuilder('capabilityLib')
      .where('capabilityLib.id = :id', { id })
      .leftJoinAndSelect('capabilityLib.kpi_libs', 'kpi_libs')
      .getOne();
  }

  async create(data: CapabilityLibCreationInput): Promise<CapabilityLib> {
    data.kpi_libs = data.kpi_libs ? await this.kpiLibRepository.findByIds(data.kpi_libs) : [];
    return await this.capabilityLibRepository.save(new CapabilityLib(data));
  }

  async save(id: number, data: CapabilityLibInput): Promise<CapabilityLib> {
    data.kpi_libs = data.kpi_libs ? await this.kpiLibRepository.findByIds(data.kpi_libs) : [];
    return this.capabilityLibRepository.save(data);
  }

  async remove(id: any) {
    id = parseInt(id, 10);
    const node = await this.capabilityLibRepository.findOne(id);
    if (node) {
      await this.capabilityLibRepository.remove(node);
    }
    return { id };
  }

  getFindAllQuery(query: CapabilityLibsArgs): FindManyOptions {
    const { page, skip, limit, ...where } = query;
    return {
      skip: (page - 1) * limit,
      take: limit,
      where,
    };
  }
}
