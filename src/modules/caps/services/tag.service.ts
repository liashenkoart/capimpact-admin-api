import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from '@modules/common/services';
import { Tag } from '../entities';


@Injectable()
export class TagService extends BaseService {
  constructor(
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>
  ) {
    super();
  }

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find();
  }

}
