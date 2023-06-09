import { Injectable, forwardRef, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import _ from 'lodash';

import { IndustryGraphService } from '../industry/service/industry.graph.service';

import { BaseService } from '@modules/common/services';
import { Startup } from '../startup/startup.entity';
import { CapabilityTree} from '../capability-tree/capability-tree.entity';
import { Capability } from '../capability/capability.entity';
import { Tag } from '../tags/tag.entity';
import { StartupCreationInput, StartupInput, StartupsArgs, StartupCapsDto } from './dto';
import { asyncForEach } from '@lib/sorting';
import { CapabilityLibService } from "../capability-libs/capability-lib.service"

@Injectable()
export class StartupService extends BaseService {
  constructor(
    @Inject(forwardRef(() => IndustryGraphService))
    private readonly industryGraphService: IndustryGraphService,
    @Inject(forwardRef(() => CapabilityLibService))
    private readonly cabLibSrv: CapabilityLibService,
    @InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>,
    @InjectRepository(CapabilityTree) private readonly capabilitytTreeRepository: Repository<CapabilityTree>,
    @InjectRepository(Capability) private readonly capabilityRepository: Repository<Capability>,
    @InjectRepository(Startup) private readonly startupRepository: Repository<Startup>
  ) {
    super();
  }
  

  async findAll(args: StartupsArgs): Promise<any> {
   
    const options = this.getFindAllQuery(args);
    const startups = await this.startupRepository.find(options);

    let list = [];

   await asyncForEach(startups, async ({tags},i) => {
     let tagsEntities = [];
     if(tags.length > 0) {
       tagsEntities = await  this.tagsRepository.findByIds(tags);
     }
     list.push({...startups[i], tags: tagsEntities})   
   });

     return list;
  }

  async findOneById(cid: string): Promise<Startup> {
    const startUp = await this.startupRepository.findOne({ where: { cid }, relations: ['capabilities']});
    let tags = [];

    if(startUp.tags.length > 0) {
       tags = await  this.tagsRepository.findByIds(startUp .tags)
    }

    return {...startUp,tags};
  }

  async count(query: StartupsArgs) {
    const { skip, limit, ...where } = query;
    const count = await this.startupRepository.count({
      skip,
      take: limit,
      ...where
    });
    return { total: count };
  }

  async create(data: StartupCreationInput): Promise<Startup> {
    return await this.startupRepository.save(this.startupRepository.create(data));
  }

  async updateTages(id,dto): Promise<Startup> {
    const startUp = await this.startupRepository.findOne(id);
    startUp.tags = await this.cabLibSrv.addNewTagIfNew(dto.tags);
    return  await this.startupRepository.save(new Startup(startUp))
  }

  async saveCaps({ capabilities, cid }: StartupCapsDto): Promise<any> {
    const caps = await this.capabilitytTreeRepository.find({
      where: {
        id: In(capabilities),
      },
    }); 
    const startup = await this.findOneById(cid);   
    if(!startup) throw new NotFoundException('START UP NOT FOUND');
    
    startup.capabilities = caps;
    return  await this.startupRepository.save(startup)
 
  }
  

  async save(id: string, data: StartupInput): Promise<any> {
    const result = await this.startupRepository.save(data);
    const startup = await this.findOneById(result.cid);
    const startups = await this.startupRepository.find({
      where: { industry_tree_id: startup.industry_tree_id },
    });
    const ids = _.uniqBy(_.union(...startups.map(sup => sup.capabilities)), 'id').map(
      ({ id }) => id
    );
    let capabilities = [];
    if (ids && ids.length) {
      capabilities = await this.capabilityRepository.find({
        where: {
          id: In(ids),
        },
      });
    }

    data.tags = await this.cabLibSrv.addNewTagIfNew(data.tags);

   return  await this.startupRepository.save(new Startup(data))
    
  }


  async capabilityStartUps(id: string): Promise<any[]>{
    const list =  await this.startupRepository
    .createQueryBuilder("startups")
    .leftJoinAndSelect("startups.capabilities", "capability")
    .where("capability.id = :id", { id})
    .getMany();

   const startUps = list.map(({ cid, name, first_financing_size, last_financing_size }) => ({ cid, name,first_financing_size ,last_financing_size}))
                        
   return startUps;
  }

  async saveMany(data: StartupInput[]) {
    await this.startupRepository.save(data);
    return await this.startupRepository.findByIds(data.map(p => p.cid));
  }

  async remove(cid: string) {
    await this.startupRepository.delete(cid);
    return { cid };
  }
}
