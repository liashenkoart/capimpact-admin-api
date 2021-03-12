import { Injectable, forwardRef, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Raw, Not } from 'typeorm';
import { CapabilityTreeService } from '../capability-tree/capability-tree.service';
import { Tag } from '../tags/tag.entity';
import { CapabilityLibsArgs, CapabilityLibCreationInput, CapabilityLibInput, CapabilityLibItemResponse, CapabilityLibNameAvailableArgs } from './dto';
import { asyncForEach } from '@lib/sorting';
import { CapabilityLib } from '../capability-libs/capability-lib.entity';
import { CapabilityTree } from '../capability-tree/capability-tree.entity';
import { IndustryTree} from '../industry-tree/industry-tree.entity';
import { TagService } from '../tags/tags.service';
import { KpiLibService } from '../kpi-lib/kpi-lib.service';
import { CapabilityTreeCreationInput } from '../capability-tree/dto';


const masterTreeTemplate = { cap_name: 'Master CapTree', type: 'master', parentId: null };

@Injectable()
export class CapabilityLibService {
  constructor(
    @Inject(forwardRef(() => CapabilityTreeService))
    private readonly capabilityTreeService: CapabilityTreeService,
    @Inject(forwardRef(() => TagService))
    private readonly tasgSrv: TagService,
    @Inject(forwardRef(() => KpiLibService))
    private readonly kpiLibSrv: KpiLibService,
    @InjectRepository(IndustryTree) private readonly industryTreeRepository: Repository<IndustryTree>,
    @InjectRepository(CapabilityTree) private readonly capabilityTreeRepository: Repository<CapabilityTree>,
    @InjectRepository(CapabilityLib) private readonly capabilityLibRepository: Repository<CapabilityLib>,
  ) { }

  async findAll(query: CapabilityLibsArgs): Promise<CapabilityLibItemResponse[]> {

    // TODO: Change to adapt to every query
    const options: any = this.getFindAllQuery(query);
     
    if (options.sort) {
      options.order = { [options.sort[0]]: options.sort[1] }
    }

      options.where = []
    
    if (query.status) {
        options.where.push({ status: query.status })
    }

    if (query.search) {
       options.where = [ ...options.where, 
                        { name: Raw(alias => `${alias} ILIKE '%${query.search}%'`)},
                        { description: Raw(alias => `${alias} ILIKE '%${query.search}%'`)}]
    }
      // FOR CAPABILITY TABLE /capability_libs
    const sortedCaps = await this.capabilityLibRepository.find({ ...options, relations:['kpi_libs']});
    let caps = [];

    await asyncForEach(sortedCaps, async ({tags},i) => {
      let tagsEntities = [];
      if(tags.length > 0) {
        tagsEntities = await  this.tasgSrv.tagRepository.findByIds(tags);
      }
      caps.push({...sortedCaps[i], tags: tagsEntities})   
    });

    return caps;
  }

  async count(query: CapabilityLibsArgs): Promise<Object> {
    const { skip, limit, ...where } = query;

    const count = await this.capabilityLibRepository.count({
      skip,
      take: limit,
      ...where
    });
    return { total: count };
  }

  async findOneById(id: number): Promise<CapabilityLibItemResponse>{
    const capabilityLib = await this.getOneByIdWithKpiLibs(id);
    let tags = [];

    if(capabilityLib.tags.length > 0) {
       tags = await  this.tasgSrv.tagRepository.findByIds(capabilityLib.tags)
    }
    return {...capabilityLib,tags};
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

  //if new tag is added it is saved in database and then its ID is added to array capability tags
  async  addNewTagIfNew(tagsList:any[]):Promise<number[]> {
    let tags = tagsList;
    await asyncForEach(tags, async ({ id,  __isNew__, value },i) => {
        if(__isNew__) {
            const tag = new Tag(); 
            tag.value = value; 
            const newTag = await this.tasgSrv.tagRepository.save(tag)
            tags[i] = newTag;
        }
    });
    tags = tags.map((i) => i.id);
    return tags;
  }

  async nameIsAvaliable(data: CapabilityLibNameAvailableArgs): Promise<{ available: boolean }>{
    let { id, name } = data;
    let where = { ...(id ? { id: Not(id) } : { }), name:  Raw(alias => `${alias} ILIKE '${name}'`)  };
    const capLib =  await this.capabilityLibRepository.findOne({where});
    return { available: Boolean(capLib) };
  }


  async create(data: CapabilityLibCreationInput): Promise<CapabilityLib> {
   const { industryId, tags, name, kpi_libs } = data;
   const { available } =  await this.nameIsAvaliable({ name: name });

    if(available)  throw new ConflictException(`${name} alredy exists`)
    
    if(data.tags){
       data.tags = await this.addNewTagIfNew(tags);
    }

    data.kpi_libs = kpi_libs ? await this.kpiLibSrv.kpilibRepository.findByIds(kpi_libs) : [];
    const cap_lib = await this.capabilityLibRepository.save(new CapabilityLib(data));

    if(industryId) {  
     const masterRoot = await this.capabilityTreeRepository.findOne(masterTreeTemplate);
     const industryTreeRoot = await this.capabilityTreeRepository.findOne({ type: 'industry',industry_tree_id: industryId, parentId: null});
     Promise.all([
         await this.capabilityTreeService.addCapLibToTree({ capability_lib_id: cap_lib.id, parentId: masterRoot.id }),
         await this.capabilityTreeService.addCapLibToTree({ capability_lib_id: cap_lib.id, parentId: industryTreeRoot.id, props: { industry_tree_id: industryId} })
     ]);
    }

    return cap_lib;
  }

  async save(id: number, data: CapabilityLibInput): Promise<CapabilityLib> {
   const { available } = await this.nameIsAvaliable({ id, name: data.name });
   if(available)  throw new ConflictException(`${data.name} alredy exists`);

    const { kpi_libs } = await this.getOneByIdWithKpiLibs(id);
    const kpi_lib_ids = kpi_libs.map(({ id }) => id);
    let newKpiLibs = [];
    if (data.kpi_libs) {
      newKpiLibs = (await this.kpiLibSrv.kpilibRepository.findByIds(data.kpi_libs))
        .filter(({ id }) => !kpi_lib_ids.includes(id));
    }

    data.tags = await this.addNewTagIfNew(data.tags);
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
    const { skip, limit, ...where } = query;
    return {
      skip,
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
