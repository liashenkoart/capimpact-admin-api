import {
    Controller,
    Get,
    UseInterceptors,
    ClassSerializerInterceptor,
  } from '@nestjs/common';
import { ValueDriverLibService } from './value_driver_lib.service';

  @UseInterceptors(ClassSerializerInterceptor)
  @Controller('valuedriverlibs')
  export class ValueDriverLibController {
    constructor(private readonly valueDriverlIBSService: ValueDriverLibService) {}

    @Get()
    list() {
        return this.valueDriverlIBSService.list();
    }
  }
  