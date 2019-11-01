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

import { ProcessService } from '@modules/processes/process.service';
import { ProcessQueryInput, ProcessInput, ProcessCreationInput } from '@modules/processes/dto';

@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('processes')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Get('/')
  async findAll(@Query() query: ProcessQueryInput) {
    return this.processService.findAll(query);
  }

  @Get('/:id')
  async findOne(@Param('id') id: number) {
    return this.processService.findById(id);
  }

  @Post('/')
  async create(@Body() data: ProcessCreationInput) {
    return this.processService.create(data);
  }

  @Post('/:id')
  async save(@Param('id') id: number, @Body() data: ProcessInput) {
    return this.processService.save(id, data);
  }

  @Delete('/:id')
  async remove(@Param('id') id: number) {
    return this.processService.remove(id);
  }
}
