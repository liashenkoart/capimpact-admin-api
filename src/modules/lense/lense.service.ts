import { Injectable, HttpService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,FindManyOptions } from 'typeorm';

import { Lense } from './lense.entity';
import { LensesArgs } from './dto';

@Injectable()
export class LenseService {
  constructor(@InjectRepository(Lense) private readonly lenseRepository: Repository<Lense>) {}

  async findAll(args: LensesArgs): Promise<Lense[]> {
    // const options = this.getFindAllQuery(args);

    let result = await this.lenseRepository.find({
      order: {id: 'ASC'},
      ...args,
      relations: ["classifications"]
    });

    return result
  }

  getFindAllQuery(query: LensesArgs): FindManyOptions {
    const { page, skip, limit, ...params } = query;
    let where: any = params;

    return {
      skip: (page - 1) * limit,
      take: limit,
      where,
    };
  }
}
