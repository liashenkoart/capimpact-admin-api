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
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ProcessService } from '@modules/processes/process.service';
import { ProcessQueryInput, ProcessInput, ProcessCreationInput } from '@modules/processes/dto';

@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('processes')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Get('')
  async findAll(@Query() query: ProcessQueryInput) {
    return this.processService.findAll(query);
  }

  @Get('tree')
  async tree(@Query() query: ProcessQueryInput) {
    return this.processService.tree(query);
  }

  @Get('/:id')
  async findOne(@Param('id') id: number) {
    return this.processService.findById(id);
  }

  @Post('')
  async create(@Body() data: ProcessCreationInput) {
    return this.processService.create(data);
  }

  @Post('/:id')
  async save(@Param('id') id: number, @Body() data: ProcessInput) {
    console.log(id, data)
    return this.processService.save(id, data);
  }

  @Post('/:industryId/clone')
  async clone(@Param('industryId') industryId: number) {
    return this.processService.clone(industryId);
  }

  @Delete('/:id')
  async remove(@Param('id') id: number) {
    return this.processService.remove(id);
  }
}
