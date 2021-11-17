import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryBuilder} from 'typeorm';

import { ValueDriverLib } from './value_driver_lib.entity';

@Injectable()
export class ValueDriverLibService {
  constructor(@InjectRepository(ValueDriverLib) private readonly valueDriverLibsRepository: Repository<ValueDriverLib>) {} 

   async list() {
        return await this.queryBuilder()
                          .select()
                          .getRawMany();
    }

    async create(dto: any) {
        return await this.queryBuilder()
        .insert()
        .into('value_driver_lib')
        .values(dto)
        .execute();
    }

    private queryBuilder(): QueryBuilder<ValueDriverLib> {
        return this.valueDriverLibsRepository.createQueryBuilder('value_driver_lib')
        .createQueryBuilder()
    }

    async update(id: number,dto: any) {
        return await this.queryBuilder()
        .update(ValueDriverLib)
        .set(dto)
        .where("id = :id", { id })
        .execute();
    }
}
