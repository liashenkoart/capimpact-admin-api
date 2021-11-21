import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryBuilder, SelectQueryBuilder} from 'typeorm';
import { ValueDriverLib } from './value_driver_lib.entity';
import { TagService } from '../tags/tags.service';
import { CapabilityLibNameAvailableArgs,
         UpdateValueDriverLibDto, 
         CreateValueDriverLibDto,
         UpdateValueDriverLibResponseDto,
         CreateValueDriverLibResponseDto, 
         ValueDriveLib} from './index.dto';

@Injectable()
export class ValueDriverLibService {  

   private baseSelectedNames = ['vdl.id as id','vdl.name as name','vdl.description as description','vdl.status as status'];
  
   constructor(
      @InjectRepository(ValueDriverLib) private readonly valueDriverLibsRepository: Repository<ValueDriverLib>,
      private tagsSrv: TagService) {} 

      async list(query:CapabilityLibNameAvailableArgs): Promise<any> {

         const { page, limit, search } = query;

         const [countResult, data] = await Promise.all([await this.countQuery(limit,search),
                                                         await this.searchQuery(query)]);
         const { pages } = countResult;
   
         return { pages: pages, page, data };
    }

    private appendSearchCondition(query, key: string): SelectQueryBuilder<ValueDriveLib>{
        if(key) {
            query.where("vdl.name ILIKE :key")
                      .orWhere("vdl.description ILIKE :key")
                      .setParameter('key',`%${key}%` )        
        }
        return query;
    }

    private async countQuery(limit: number, search: string): Promise<{ pages: number }> {
        const countQuery = this.queryBuilder()
        .select('ceil(COUNT(vdl.id)::decimal / :limit)::INTEGER','pages') 
        .setParameter('limit',limit)
        return await this.appendSearchCondition(countQuery,search).getRawOne();
    }

    private async searchQuery({ page, limit, search, order } :CapabilityLibNameAvailableArgs) {
      
        const dataQuery = await this.queryBuilder() 
                                    .select(this.baseSelectedNames)
                                    .addSelect(`(SELECT coalesce(json_agg(json_build_object('id',tags.id,'value',tags.value,'label',tags.value)), '[]'::json) FROM tags WHERE vdl.tags @> to_jsonb(ARRAY[tags.id]) )`,'tags')
                                    .skip(page * limit)
                                    .take(limit);

        if(order) {
           dataQuery.orderBy(order.name, order.direction)
        }

        return await this.appendSearchCondition(dataQuery,search).getRawMany();
    }

    private async valueDriverLibNameExists(name: string) {
      const exist = await this.valueDriverLibsRepository.createQueryBuilder('lib')
                                                        .select('id')
                                                        .where('lib.name =:name', { name })
                                                        .getRawOne();
      if(exist) throw new BadRequestException('Value Driver Lib Name Exists');                                                 
      return exist;
    }

    async create(dto: CreateValueDriverLibDto): Promise<CreateValueDriverLibResponseDto>{
       const { name } = dto;
      
       await this.valueDriverLibNameExists(name);
       
       dto.tags = await this.tagsSrv.insertTagsIfNew(dto.tags);

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
       const { affected } =  await this.queryBuilder()
            .delete()
            .from(ValueDriverLib)
            .where("id = :id", { id })
            .execute();
       return { affected }
    }

    async findOne(id: number) {
       const valueDriverLib = await this.valueDriverLibsRepository
                                        .createQueryBuilder('vdl')
                                        .select(this.baseSelectedNames)
                                        .addSelect(`(SELECT coalesce(json_agg(json_build_object('id',tags.id,'value',tags.value,'label',tags.value)), '[]'::json) FROM tags WHERE vdl.tags @> to_jsonb(ARRAY[tags.id]) )`,'tags')
                                        .where('vdl.id = :id', { id })
                                        .groupBy('vdl.id')
                                        .getRawOne();

       if(!valueDriverLib) throw new NotFoundException('Not Found');
       return valueDriverLib;
    }

    async update(id: number,dto: UpdateValueDriverLibDto): Promise<UpdateValueDriverLibResponseDto> {

        dto.tags = await this.tagsSrv.insertTagsIfNew(dto.tags);

        const { affected, raw: [entity] } =  await this.queryBuilder()
        .update(ValueDriverLib)
        .set(dto)
        .where("id = :id", { id })
        .returning(['id','name','description','status','tags'])
        .execute();

        if(affected === 1 ) {
           return entity;
        } else {
           throw new NotFoundException('Not Found')
        }
    }

}
