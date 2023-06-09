import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from '@modules/common/services';
import { Technology } from './technology.entity';
import { asyncForEach } from '@lib/sorting';
import { map, uniq, difference } from 'lodash';

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

  async insertTechsIfNew(names: string[]): Promise<number[]>{
    if(names.length > 0) {
        const filteredOnUniq = uniq(names);

        const tags =  await  this.technologyRepository.createQueryBuilder('tags')
        .select('tags.id','id')
        .addSelect('tags.value','value')
        .where("tags.value IN (:...values)")
        .setParameter('values',filteredOnUniq)
        .getRawMany();

        const newTags = difference(filteredOnUniq,map(tags,'value'));
        const { raw = [] } =  await this.technologyRepository.createQueryBuilder('tags')
                                                          .insert()
                                                          .into(Technology)
                                                          .values(map(newTags, value => ({ value })))
                                                          .returning(['id','value'])
                                                          .execute();

        return map(tags.concat(raw),'id');
    } else {
      return []
    }
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
