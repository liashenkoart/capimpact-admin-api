import {
    Controller,
    Get,
    Post,
    UseGuards,
    Body,
    UseInterceptors,
    ClassSerializerInterceptor,
    Param,
    Delete,
    Query,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
  
  import { LensesArgs } from './dto';
  import { LenseService } from './lense.service'
  import { LENSES_API_TAG } from './lenses.constants';

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiTags(LENSES_API_TAG)
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller(LENSES_API_TAG)
  export class LenseController {
  
    constructor(private readonly lenseService: LenseService) {}
  
    @Get('')
    async findAll(@Param() args: LensesArgs) {
      return this.lenseService.findAll(args);
    }
  
  }
  