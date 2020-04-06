import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from 'modules/common/services';

import { KpiBenchmark } from '../entities';
import { KpiBenchmarkCreationInput, KpiBenchmarkInput, KpiBenchmarksArgs } from '../dto';

@Injectable()
export class KpiBenchmarkService extends BaseService {
  constructor(@InjectRepository(KpiBenchmark) private readonly kpiBenchmarkRepository: Repository<KpiBenchmark>) {
    super();
  }

  async findAll(args: KpiBenchmarksArgs): Promise<KpiBenchmark[]> {
    return await this.kpiBenchmarkRepository.find(this.getFindAllQuery(args));
  }

  async findAllPagination(args: KpiBenchmarksArgs): Promise<[KpiBenchmark[], number]> {
    return await this.kpiBenchmarkRepository.findAndCount(this.getFindAllQuery(args));
  }

  async findOneById(id: number): Promise<KpiBenchmark> {
    return this.kpiBenchmarkRepository.findOne(id);
  }

  async count(args: KpiBenchmarksArgs) {
    const count = await this.kpiBenchmarkRepository.count({ where: args });
    return { total: count };
  }

  async create(data: KpiBenchmarkCreationInput): Promise<KpiBenchmark> {
    return await this.kpiBenchmarkRepository.save(this.kpiBenchmarkRepository.create(data));
  }

  async save(id: number, data: KpiBenchmarkInput): Promise<KpiBenchmark> {
    return this.kpiBenchmarkRepository.save(data);
  }

  async saveMany(data: KpiBenchmarkInput[]) {
    await this.kpiBenchmarkRepository.save(data);
    return await this.kpiBenchmarkRepository.findByIds(data.map(kl => kl.id));
  }

  async remove(id: number) {
    await this.kpiBenchmarkRepository.delete(id);
    return { id };
  }
}
