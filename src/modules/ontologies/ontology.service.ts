import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ontology } from './ontology.entity';

@Injectable()
export class OntologyService {
  constructor(@InjectRepository(Ontology) private readonly ontologyRepository: Repository<Ontology>) {}
}