import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from '@modules/common/services';
import { Tag } from './tag.entity';

import { asyncForEach } from '@lib/sorting';
import { map, uniq } from 'lodash';

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

  async findTagsByIds(ids: number[]): Promise<any>{
    const tags =  await  this.tagRepository.createQueryBuilder('tags')
    .select('tags.id','id')
    .where("tags.id IN(:...ids)")
    .setParameter('ids',uniq(ids))
    .getRawMany();

    return map(tags,'id');
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
