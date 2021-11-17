import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ValueDriverLib } from './value_driver_lib.entity';

@Injectable()
export class ValueDriverLibService {
  constructor(@InjectRepository(ValueDriverLib) private readonly userRepository: Repository<ValueDriverLib>) {} 
}
