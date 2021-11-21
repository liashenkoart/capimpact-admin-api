import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from '@modules/common/services';
import { Tag } from './tag.entity';

import { asyncForEach } from '@lib/sorting';
import { map, uniq, difference, merge } from 'lodash';

@Injectable()
export class TagService extends BaseService {
  constructor(
    @InjectRepository(Tag) public readonly tagRepository: Repository<Tag>
  ) {
    super();
  }

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find();
  }
  
  async findByIds(ids: []) {
    return  await  this.tagRepository.createQueryBuilder('tags')
    .select('tags.id','id')
    .addSelect('tags.value','value')
    .where("tags.id IN(:...ids)")
    .setParameter('ids',ids)
    .getRawMany();
  }

  async insertTagsIfNew(names: number[]): Promise<number[]>{
      if(names.length > 1) {
          const filteredOnUniq = uniq(names);

          const tags =  await  this.tagRepository.createQueryBuilder('tags')
          .select('tags.id','id')
          .addSelect('tags.value','value')
          .where("tags.value IN (:...values)")
          .setParameter('values',filteredOnUniq)
          .getRawMany();

          const newTags = difference(filteredOnUniq,map(tags,'value'));
          const { raw = [] } =  await this.tagRepository.createQueryBuilder('tags')
                                                            .insert()
                                                            .into(Tag)
                                                            .values(map(newTags, value => ({ value })))
                                                            .returning(['id','value'])
                                                            .execute();

          return map(tags.concat(raw),'id');
      } else {
        return []
      }
  }

  async addTagIfNew(tagsList:any[]):Promise<number[]> {
    let tags = tagsList;
    await asyncForEach(tags, async ({ id,  __isNew__, value },i) => {
        if(__isNew__) {
            const tag = new Tag(); 
            tag.value = value; 
            const newTag = await this.tagRepository.save(tag)
            tags[i] = newTag;
        }
    });
    tags = tags.map((i) => i.id);
    return tags;
  }

}
