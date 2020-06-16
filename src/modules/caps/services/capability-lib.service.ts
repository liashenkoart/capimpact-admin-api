import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';

import { CapabilityLib } from '../entities';
import { CapabilityLibsArgs, CapabilityLibCreationInput, CapabilityLibInput } from '../dto';

@Injectable()
export class CapabilityLibService {
  constructor(
    @InjectRepository(CapabilityLib) private readonly capabilityLibRepository: Repository<CapabilityLib>,
  ) {}

  async findAll(query: CapabilityLibsArgs): Promise<CapabilityLib[] | void> {
    const options = this.getFindAllQuery(query);

    return this.capabilityLibRepository.find(options);
  }

  async findOneById(id: number): Promise<CapabilityLib> {
    return this.capabilityLibRepository.findOne({ id });
  }

  async create(data: CapabilityLibCreationInput): Promise<CapabilityLib> {
    let capabilityLib = new CapabilityLib(data);
    capabilityLib = await this.capabilityLibRepository.save(capabilityLib);
    return await this.findOneById(capabilityLib.id);
  }

  async save(id: any, data: CapabilityLibInput): Promise<CapabilityLib> {
    let capabilityLib = new CapabilityLib({ ...data });
    capabilityLib.id = parseInt(id, 10);
    capabilityLib = await this.capabilityLibRepository.save(capabilityLib);
    capabilityLib = await this.capabilityLibRepository.findOne({ id: capabilityLib.id });
    return await this.findOneById(capabilityLib.id);
  }

  async remove(id: any) {
    id = parseInt(id, 10);
    const node = await this.capabilityLibRepository.findOne(id);
    if (node) {
      await this.capabilityLibRepository.remove(node);
    }
    return { id };
  }

  getFindAllQuery(query: CapabilityLibsArgs): FindManyOptions {
    const { page, skip, limit, ...where } = query;
    return {
      skip: (page - 1) * limit,
      take: limit,
      where,
    };
  }
}
