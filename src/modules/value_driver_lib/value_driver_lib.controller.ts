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
import { ValueDriverLibService } from './value_driver_lib.service';

  @UseInterceptors(ClassSerializerInterceptor)
  @Controller('valuedriverlibs')
  export class ValueDriverLibController {
    constructor(private readonly valueDriverlIBSService: ValueDriverLibService) {}
  }
  