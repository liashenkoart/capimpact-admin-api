import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Startup } from '../entities';
import { StartupCreationInput, StartupInput, StartupsArgs } from '../dto';

//import { ProcessService } from './process.service';
//import { CapabilityService } from './capability.service';
//import { CompanyService } from './company.service';

@Injectable()
export class StartupService {
  constructor(@InjectRepository(Startup) private readonly startupRepository: Repository<Startup>) {}

  async findAll(args: StartupsArgs): Promise<Startup[]> {
    return await this.startupRepository.find({ where: args, order: { name: 'ASC' } });
  }

  async findOneById(id: string): Promise<Startup> {
    return this.startupRepository.findOne(id);
  }

  async count(args: StartupsArgs) {
    const count = await this.startupRepository.count({ where: args });
    console.log(count)
    return { total: count };
  }

  async create(data: StartupCreationInput): Promise<Startup> {
    return await this.startupRepository.save(this.startupRepository.create(data));
  }

  async save(id: string, data: StartupInput): Promise<Startup> {
    return this.startupRepository.save(data);
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
