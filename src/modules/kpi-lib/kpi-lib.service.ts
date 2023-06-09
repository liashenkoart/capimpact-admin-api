import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from 'modules/common/services';
import { CapabilityLibService } from "../capability-libs/capability-lib.service"
import { CapabilityLib } from '../capability-libs/capability-lib.entity';
import { KpiLib } from '../kpi-lib/kpi-lib.entity';
import { Tag } from '../tags/tag.entity';
import { KpiLibCreationInput, KpiLibInput, KpiLibsArgs } from './dto';
import { asyncForEach } from '@lib/sorting';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class KpiLibService extends BaseService implements OnModuleInit{
 
  private capabiliLibSrv: CapabilityLibService;
  constructor(
    private moduleRef: ModuleRef,
    @InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>,
    @InjectRepository(KpiLib) public readonly kpilibRepository: Repository<KpiLib>,
    @InjectRepository(CapabilityLib) private readonly capabilityLibRepository: Repository<CapabilityLib>
  ) {
    super();
  }
  onModuleInit() {
    this.capabiliLibSrv = this.moduleRef.get(CapabilityLibService, { strict: false });
  }


  async simpleFullList() {
    return await this.kpilibRepository.createQueryBuilder('kpis').select(["kpis.id as id",'label as label']).getRawMany()
  }

  async findManyKpisByIds(ids: number[]) {
    return await this.kpilibRepository.createQueryBuilder('kpis').select("kpis.id",'id').whereInIds(ids).getRawMany()
  }

  async findAll(args: KpiLibsArgs): Promise<KpiLib[]> {
    const options = this.getFindAllQuery(args);
    options.relations = ['capability_libs'];
    const kpis = await this.kpilibRepository.find(options);
    let kpiResponse = [];

    await asyncForEach(kpis, async ({tags},i) => {
      let tagsEntities = [];
      if( tags && tags.length > 0) {
        tagsEntities = await  this.tagsRepository.findByIds(tags);
      }
      kpiResponse.push({...kpis[i], tags: tagsEntities})   
    });

    return kpiResponse;
  }

  async findAllPagination(args: KpiLibsArgs): Promise<[KpiLib[], number]> {
    return await this.kpilibRepository.findAndCount(this.getFindAllQuery(args));
  }
  

  async findOneById(id: number): Promise<KpiLib> {
    const libs = await this.getOneByIdWithCapabilityLibs(id);
    let tags = [];

    if(libs.tags.length > 0) {
       tags = await  this.tagsRepository.findByIds(libs.tags)
    }
    return {...libs,tags};
  }

  async count(args: KpiLibsArgs) {
    const { skip, limit, ...where } = args;
    const count = await this.kpilibRepository.count({
      skip,
      take: limit,
      ...where
    });
    return { total: count };
  }

  async create(data: KpiLibCreationInput): Promise<any> {
    data.capability_libs = data.capability_libs
      ? await this.capabilityLibRepository.findByIds(data.capability_libs) : [];
   
    if(data.tags){
      data.tags = await this.capabiliLibSrv.addNewTagIfNew(data.tags)
   }
   
      return await this.kpilibRepository.save(data);
  }

  async save(id: number, data: KpiLibInput): Promise<KpiLib> {
    const { capability_libs } = await this.getOneByIdWithCapabilityLibs(id);
    const capability_lib_ids = capability_libs.map(({ id }) => id);
    let newCapabilityLibs = [];
    if (data.capability_libs) {
      newCapabilityLibs = (await this.capabilityLibRepository.findByIds(data.capability_libs))
        .filter(({ id }) => !capability_lib_ids.includes(id));
    }

    data.tags = await this.capabiliLibSrv.addNewTagIfNew(data.tags);
    data.id = id;
    data.capability_libs = [...capability_libs, ...newCapabilityLibs];
    return this.kpilibRepository.save(new KpiLib(data));
  }

  async saveMany(data: KpiLibInput[]) {
   // await this.kpilibRepository.save(data);
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
