import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from 'modules/common/services';

import { Challenge } from '../entities';
import { ChallengeCreationInput, ChallengeInput, ChallengesArgs } from '../dto';

@Injectable()
export class ChallengeService extends BaseService {
  constructor(
    @InjectRepository(Challenge) private readonly challengeRepository: Repository<Challenge>
  ) {
    super();
  }

  async findAll(args: ChallengesArgs): Promise<Challenge[]> {
    return await this.challengeRepository.find(this.getFindAllQuery(args));
  }

  async findAllPagination(args: ChallengesArgs): Promise<[Challenge[], number]> {
    return await this.challengeRepository.findAndCount(this.getFindAllQuery(args));
  }

  async findOneById(id: number): Promise<Challenge> {
    return this.challengeRepository.findOne(id);
  }

  async create(data: ChallengeCreationInput): Promise<Challenge> {
    return await this.challengeRepository.save(this.challengeRepository.create(data));
  }

  async save(data: ChallengeInput): Promise<Challenge> {
    return this.challengeRepository.save(data);
  }

  async saveMany(data: ChallengeInput[]) {
    await this.challengeRepository.save(data);
    return await this.challengeRepository.findByIds(data.map(item => item.id));
  }

  async remove(id: number) {
    await this.challengeRepository.delete(id);
    return { id };
  }
}
