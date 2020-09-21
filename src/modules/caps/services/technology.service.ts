import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from '@modules/common/services';
import { Technology } from '../entities';

import { asyncForEach } from '@lib/sorting';


@Injectable()
export class TechnologyService extends BaseService {
  constructor(
    @InjectRepository(Technology) public readonly technologyRepository: Repository<Technology>
  ) {
    super();
  }

  async findbyIds(ids: number []): Promise<Technology[]> {
    return this.technologyRepository.findByIds(ids);
  }

  async list(): Promise<Technology[]> {
    return this.technologyRepository.find();
  }

  async addTechIfNew(tagsList:any[]):Promise<number[]> {
    let tags = tagsList;
    await asyncForEach(tags, async ({ id,  __isNew__, value },i) => {
        if(__isNew__) {
            const tag = new Technology(); 
            tag.value = value; 
            const newTag = await this.technologyRepository.save(tag)
            tags[i] = newTag;
        }
    });
    tags = tags.map((i) => i.id);
    return tags;
  }
}
