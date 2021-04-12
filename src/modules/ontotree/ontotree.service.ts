import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OntoTree } from './ontotree.entity';

@Injectable()
export class OntoTreeService {
  constructor(@InjectRepository(OntoTree) private readonly ontoTreeRepository: Repository<OntoTree>) {}
}