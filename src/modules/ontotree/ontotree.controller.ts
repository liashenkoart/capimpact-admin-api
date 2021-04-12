import {
    Controller,
    UseGuards,
    UseInterceptors,
    ClassSerializerInterceptor,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
  import { ONTOTREE_API_TAG } from './ontotree.constants';

  @ApiBearerAuth()
  @ApiTags(ONTOTREE_API_TAG)
  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller(ONTOTREE_API_TAG)
  export class OntoTreeController {}
  