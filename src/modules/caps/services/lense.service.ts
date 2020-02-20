import { Injectable, HttpService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Lense } from '../entities';
import { LensesArgs } from '../dto';

@Injectable()
export class LenseService {
  constructor(@InjectRepository(Lense) private readonly lenseRepository: Repository<Lense>) {}

  async findAll(args: LensesArgs): Promise<Lense[]> {
    let result = await this.lenseRepository.find({
      where: args,
      order: {id: 'ASC'},
      relations: ["classifications"]
    });

    return result
  }
}
