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
  import { ApiTags, ApiBearerAuth, ApiCreatedResponse, ApiBody } from '@nestjs/swagger';
  
  import { LensesArgs } from './dto';
  import { LenseService } from './lense.service'
  
  @ApiBearerAuth()
  //@UseGuards(AuthGuard())
  @ApiTags('lenses')
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller('lenses')
  export class LenseController {
  
    constructor(private readonly lenseService: LenseService) {}
  
    @Get('')
    async findAll(@Param() args: LensesArgs) {
      return this.lenseService.findAll(args);
    }
  
  }
  