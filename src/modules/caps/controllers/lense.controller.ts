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

import { LensesArgs } from '../dto';
import { LenseService } from '../services'

@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('lenses')
export class LenseController {

  constructor(private readonly lenseService: LenseService) {}

  @Get('')
  async findAll(@Param() args: LensesArgs) {
    return this.lenseService.findAll(args);
  }

}
