import {
    Controller,
    Get,
    UseGuards,
    UseInterceptors,
    ClassSerializerInterceptor,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
  import { TechnologyService } from './technology.service';
 import { TECHNOLOGY_API_TAG } from './technology.constants'

  @ApiBearerAuth()
  @ApiTags(TECHNOLOGY_API_TAG)
  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller(TECHNOLOGY_API_TAG)
  export class TechnologiesController {
    constructor(private readonly techService: TechnologyService) {}
  
    @Get('')
    async findAll() {
      return this.techService.list()
    }
  }
  