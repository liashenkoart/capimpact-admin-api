import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, In } from 'typeorm';
import _ from 'lodash';

import { IndustryGraphService } from '@modules/caps/services/industry.graph.service';

import { BaseService } from '@modules/common/services';
import { Startup, Capability } from '../entities';
import { StartupCreationInput, StartupInput, StartupsArgs } from '../dto';

//import { ProcessService } from './process.service';
//import { CapabilityService } from './capability.service';
//import { CompanyService } from './company.service';

@Injectable()
export class StartupService extends BaseService {
  constructor(
    private readonly industryGraphService: IndustryGraphService,
    @InjectRepository(Capability) private readonly capabilityRepository: Repository<Capability>,
    @InjectRepository(Startup) private readonly startupRepository: Repository<Startup>
  ) {
    super();
  }

  async findAll(args: StartupsArgs): Promise<Startup[]> {
    const options = this.getFindAllQuery(args);
    return await this.startupRepository.find(options);
  }

  async findOneById(id: string): Promise<Startup> {
    return this.startupRepository.findOne(id);
  }

  async count(args: StartupsArgs) {
    const count = await this.startupRepository.count({ where: args });
    return { total: count };
  }

  async create(data: StartupCreationInput): Promise<Startup> {
    return await this.startupRepository.save(this.startupRepository.create(data));
  }

  async save(id: string, data: StartupInput): Promise<Startup> {
    const result = await this.startupRepository.save(data);
    const startup = await this.findOneById(result.cid);
    const startups = await this.startupRepository.find({
      where: { industry_id: startup.industry_id },
    });
    const ids = _.uniqBy(_.union(...startups.map(sup => sup.capabilities)), 'id').map(
      ({ id }) => id
    );
    let capabilities = [];
    if (ids && ids.length) {
      capabilities = await this.capabilityRepository.find({
        where: {
          id: In(ids),
        },
      });
    }
    await this.industryGraphService.saveIndustryCapabilitiesById(startup.industry_id, {
      capabilities,
    });
    return startup;
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
