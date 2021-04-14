import {
    Controller,
    UseInterceptors,
    ClassSerializerInterceptor,
    Get,
    Param
  } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ONTOTREE_API_TAG } from './ontotree.constants';
import { OntoTreeService } from './ontotree.service';
import { OntoTree } from './ontotree.entity';

@ApiTags(ONTOTREE_API_TAG)
@UseInterceptors(ClassSerializerInterceptor)
@Controller(ONTOTREE_API_TAG)
export class OntoTreeController {

    constructor(private ontoTreeSrv: OntoTreeService) {}

    @Get(':ontologyId')
    tree(@Param('ontologyId') id: number): Promise<[OntoTree]>  {
      return this.ontoTreeSrv.treeByOntologyId(id)
    }

  }
  