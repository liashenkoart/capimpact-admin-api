import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { CapabilityTreeService } from './capability-tree.service';
import { CapabilityLib, KpiLib, CapabilityTree, IndustryTree } from '../entities';
import { CapabilityLibsArgs, CapabilityLibCreationInput, CapabilityLibInput } from '../dto';
import { BaseService } from '@modules/common/services';

@Injectable()
export class CapabilityLibService {
  constructor(
    private readonly capabilityTreeService: CapabilityTreeService,
    @InjectRepository(KpiLib) private readonly kpiLibRepository: Repository<KpiLib>,
    @InjectRepository(IndustryTree) private readonly industryTreeRepository: Repository<IndustryTree>,
    @InjectRepository(CapabilityTree) private readonly capabilityTreeRepository: Repository<CapabilityTree>,
    @InjectRepository(CapabilityLib) private readonly capabilityLibRepository: Repository<CapabilityLib>,
  ) { }

  async findAll(query: CapabilityLibsArgs): Promise<CapabilityLib[] | void> {

    // TODO: Change to adapt to every query
    const options: any = this.getFindAllQuery(query);
    if (options.sort) {
      options.order = { [options.sort[0]]: options.sort[1] }
    }
    if (query.status) {
      options.where = { status: query.status }
    }

    // FOR CAPABILITY TABLE /capability_libs
    options.relations = ['kpi_libs'];
    const sortedCaps = await this.capabilityLibRepository.find(options);
    return sortedCaps
  }

  async count(query: CapabilityLibsArgs): Promise<Object> {
    const count = await this.capabilityLibRepository.count({ where: query });
    return { total: count };
  }

  async findOneById(id: number): Promise<CapabilityLib> {
    return this.getOneByIdWithKpiLibs(id);
  }

  async findAssociatedIndustries(id: number): Promise<IndustryTree | Array<any>> {
    const industry_tree_ids = await this.capabilityTreeRepository.find({
      select: ["industry_tree_id"],
      where: {capability_lib_id: id, type: 'industry'}
    })

    if(industry_tree_ids.length === 0){
      return []

    }
    const industry_ids = []
    industry_tree_ids.forEach(({industry_tree_id: id}) => {
      !industry_ids.includes(id) && industry_ids.push(id)  
    })

    const industry_names = await this.industryTreeRepository.find({
      select: ["name", "code"],
      where: industry_ids.map(id => {return {id: id}})
    })
    
    return industry_names
  }
  async create(data: CapabilityLibCreationInput): Promise<CapabilityLib> {
    data.kpi_libs = data.kpi_libs ? await this.kpiLibRepository.findByIds(data.kpi_libs) : [];
    const cap_lib = await this.capabilityLibRepository.save(new CapabilityLib(data));

    return cap_lib
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
    const options = { where: { id }, relations: ['capability_trees'] };

    const capabilityLib = await this.capabilityLibRepository.findOne(options);
    if (!capabilityLib) {
      throw new NotFoundException();
    }
    const capTrees = capabilityLib.capability_trees
    capabilityLib.capability_trees = [];
    await Promise.all(capTrees.map(capTree => this.capabilityTreeService.removeOneCapTree(capTree.id)));
    await this.capabilityLibRepository.remove(capabilityLib)


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
      ...where
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
