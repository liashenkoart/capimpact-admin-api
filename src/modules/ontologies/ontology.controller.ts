import {
    Controller,
    UseGuards,
    UseInterceptors,
    ClassSerializerInterceptor,
    Get,
  } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Ontology } from './ontology.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ONTOLOGY_API_TAG } from './ontology.constants';
import { OntologyService } from './ontology.service';

  @ApiBearerAuth()
  @ApiTags(ONTOLOGY_API_TAG)
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller(ONTOLOGY_API_TAG)
  export class OntologyController {
    constructor(private ontologySrv: OntologyService) {}

    @Get()
    list(): Promise<Ontology[]> {
      return this.ontologySrv.list()
    }
  }
  