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
    Req,
    ParseIntPipe,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
  
  import { TagService } from './tags.service';
  import { TAGS_API_TAG } from './tags.constants';

  @ApiBearerAuth()
  @ApiTags(TAGS_API_TAG)
  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller(TAGS_API_TAG)
  export class TagsController {
    constructor(private readonly tagsService: TagService) {}
  
    @Get('')
    async findAll() {
      return this.tagsService.findAll();
    }
  
  }
  