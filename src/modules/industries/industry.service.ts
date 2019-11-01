import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IndustryCreationInput, IndustryInput } from '@modules/industries/dto';
import { Industry } from './industry.entity';

@Injectable()
export class IndustryService {
  constructor(
    @InjectRepository(Industry) private readonly industryRepository: Repository<Industry>
  ) {}

  async findAll(): Promise<Industry[]> {
    return this.industryRepository.find();
  }

  async findById(id: number): Promise<Industry> {
    return this.industryRepository.findOne(id);
  }

  async findByEmail(email: string): Promise<Industry> {
    return this.industryRepository.findOne({ where: { email } });
  }

  async create(data: IndustryCreationInput): Promise<Industry> {
    const industry = new Industry(data);
    return this.industryRepository.save(industry);
  }

  async save(id: number, data: IndustryInput): Promise<Industry> {
    const industry = new Industry({ ...data, id });
    return this.industryRepository.save(industry);
  }

  async remove(id: number) {
    return this.industryRepository.delete(id);
  }
}
