import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryBuilder} from 'typeorm';
import { ValueDriverLib } from './value_driver_lib.entity';
import { TagService } from '../tags/tags.service';
import { ValueDriverLibResponseDto,
         CapabilityLibNameAvailableArgs,
         UpdateValueDriverLibDto, 
         CreateValueDriverLibDto,
         UpdateValueDriverLibResponseDto,
         CreateValueDriverLibResponseDto,} from './index.dto';


@Injectable()
export class ValueDriverLibService {
  constructor(
      @InjectRepository(ValueDriverLib) private readonly valueDriverLibsRepository: Repository<ValueDriverLib>,
      private tagsSrv: TagService) {} 

      async list(query:CapabilityLibNameAvailableArgs): Promise<any> {
        const { page, limit, search } = query;

        const selectedNames = ['vdl.id as id','vdl.name as name','vdl.description as description','vdl.status as status','vdl.tags as tags'];

        const countQuery = this.queryBuilder()
                                .select('(COUNT(vdl.id) / :limit)::INTEGER','pages') 
                                .setParameter('limit',limit)
                         

       if(search) {
          countQuery.where("vdl.name ILIKE :key")
                    .setParameter('key',`%${search}%` )        
       }

       const { pages } = await countQuery.getRawOne();
                                    
       const dataQuery = await this.queryBuilder() 
                                   .select(selectedNames)
                                   .skip(page * limit)
                                   .take(limit)
      if(search) {
         dataQuery.where("vdl.name ILIKE :key") 
                  .setParameter('key',`%${search}%` )       
      }

      const data = await dataQuery.getRawMany()
      
      return { pages, page, data };
    }

    async create(dto: CreateValueDriverLibDto): Promise<CreateValueDriverLibResponseDto>{

       dto.tags = await this.tagsSrv.findTagsByIds(dto.tags);

       const { raw: [entity] } =  await this.queryBuilder()
        .insert()
        .into(ValueDriverLib)
        .values(dto)
        .returning(['name','description','tags'])
        .execute();
        return entity;
    }

    private queryBuilder(): QueryBuilder<ValueDriverLib> {
        return this.valueDriverLibsRepository.createQueryBuilder('vdl')
    }

    async delete(id: number) {
        return await this.queryBuilder()
            .delete()
            .from(ValueDriverLib)
            .where("id = :id", { id })
            .execute();
    }

    async update(id: number,dto: UpdateValueDriverLibDto): Promise<UpdateValueDriverLibResponseDto> {

        dto.tags = await this.tagsSrv.findTagsByIds(dto.tags);

        const { affected, raw: [entity] } =  await this.queryBuilder()
        .update(ValueDriverLib)
        .set(dto)
        .where("id = :id", { id })
        .returning(['name','description','tags'])
        .execute();

        if(affected === 1 ) {
           return entity;
        } else {
           throw new NotFoundException('Not Found')
        }
    }

}
