import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from '@modules/common/services';
import { Technology } from '../entities';

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
}
