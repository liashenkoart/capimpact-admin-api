import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ontology } from './ontology.entity';
import { ONTOLOGY_NOT_FOUND_ERROR } from './ontology.constants';

@Injectable()
export class OntologyService {
  constructor(@InjectRepository(Ontology) private readonly ontologyRepository: Repository<Ontology>) {}

  async list(): Promise<Ontology[]> {
    return this.ontologyRepository.find();
  }

  async findOneById(id: number) {
    const entity = await this.ontologyRepository.findOne(id);
    if(!entity) throw new NotFoundException(ONTOLOGY_NOT_FOUND_ERROR);
    return entity;
  }
}