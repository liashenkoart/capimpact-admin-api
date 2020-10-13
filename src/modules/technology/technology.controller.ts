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

  @ApiBearerAuth()
  @ApiTags('technologies')
  //@UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller('technologies')
  export class TechnologiesController {
    constructor(private readonly techService: TechnologyService) {}
  
    @Get('')
    async findAll() {
      return this.techService.list()
    }
  }
  