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
  import { ApiTags, ApiBearerAuth, ApiCreatedResponse, ApiBody } from '@nestjs/swagger';
  
  import { TagService } from '../services/tag.service';
  import { ProcessesArgs, ProcessInput, ProcessCreationInput } from '../dto';
  
  @ApiBearerAuth()
  @ApiTags('tags')
  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller('tags')
  export class TagsController {
    constructor(private readonly tagsService: TagService) {}
  
    @Get('')
    async findAll() {
      return this.tagsService.findAll();
    }
  
  }
  