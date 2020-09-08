import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from '@modules/common/services';
import { Tag } from '../entities';

import { asyncForEach } from '@lib/sorting';

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
