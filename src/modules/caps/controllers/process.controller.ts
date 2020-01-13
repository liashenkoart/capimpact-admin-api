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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ProcessService } from '../services';
import { ProcessesArgs, ProcessInput, ProcessCreationInput } from '../dto';

@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('processes')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Get('')
  async findAll(@Query() query: ProcessesArgs) {
    return this.processService.findAll(query);
  }

  @Get('tree')
  async tree(@Query() query: ProcessesArgs) {
    return this.processService.tree(query);
  }

  @Get('default-tree')
  async defaultTree(@Query() query: ProcessesArgs) {
    return this.processService.defaultTree(query);
  }

  @Get('/:id')
  async findOne(@Param('id') id: number) {
    return this.processService.findOneById(id);
  }

  @Post('')
  async create(@Body() data: ProcessCreationInput, @Req() req: any) {
    return this.processService.create(data, { user: req.user });
  }

  @Post('/bulk')
  async saveMany(@Body() data: ProcessInput[], @Req() req: any) {
    return this.processService.saveMany(data, { user: req.user });
  }

  @Post('/:id')
  async save(@Param('id') id: number, @Body() data: ProcessInput, @Req() req: any) {
    return this.processService.save(id, data, { user: req.user });
  }

  @Delete('/:id')
  async remove(@Param('id') id: number) {
    return this.processService.remove(id);
  }
}
