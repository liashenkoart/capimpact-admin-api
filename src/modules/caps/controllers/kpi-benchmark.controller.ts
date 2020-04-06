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
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { KpiBenchmarkService } from '../services';
import { KpiBenchmarkInput, KpiBenchmarkCreationInput, KpiBenchmarksArgs } from '../dto';

//@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('kpi-benchmarks')
export class KpiBenchmarkController {
  constructor(private readonly kpiBenchmarkService: KpiBenchmarkService) {}

  @Get('')
  async findAll(@Query() args: KpiBenchmarksArgs) {
    return this.kpiBenchmarkService.findAll(args);
  }

  @Get('/count')
  async count(@Query() args: KpiBenchmarksArgs) {
    return this.kpiBenchmarkService.count(args);
  }

  @Get('/:id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.kpiBenchmarkService.findOneById(id);
  }

  @Post('')
  async create(@Body() data: KpiBenchmarkCreationInput) {
    return this.kpiBenchmarkService.create(data);
  }

  @Post('/:id')
  async save(@Param('id', new ParseIntPipe()) id: number, @Body() data: KpiBenchmarkInput) {
    return this.kpiBenchmarkService.save(id, data);
  }

  @Post('/bulk')
  async saveMany(@Body() data: KpiBenchmarkInput[]) {
    return this.kpiBenchmarkService.saveMany(data);
  }

  @Delete('/:id')
  async remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.kpiBenchmarkService.remove(id);
  }
}
