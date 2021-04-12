import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ontology } from './ontology.entity';
import { OntologyController } from './ontology.controller';
import { OntologyService } from './ontology.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ontology])],
  controllers: [OntologyController],
  providers: [OntologyService],
  exports: [OntologyService]
})
export class OntologiesModule {}