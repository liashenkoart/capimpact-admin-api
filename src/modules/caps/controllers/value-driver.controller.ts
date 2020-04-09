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
import { ApiTags, ApiBearerAuth, ApiCreatedResponse, ApiBody } from '@nestjs/swagger';

import { ValueDriverService } from '../services';
import { ValueDriverInput, ValueDriverCreationInput, ValueDriversArgs } from '../dto';

//@UseGuards(AuthGuard())
@ApiTags('valuedrivers')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('valuedrivers')
export class ValueDriverController {
  constructor(private readonly valuedriverService: ValueDriverService) {}

  @Get('')
  async findAll(@Query() args: ValueDriversArgs) {
    return this.valuedriverService.findAll(args);
  }

  @Get('tree')
  async tree(@Query() query: ValueDriversArgs) {
    return this.valuedriverService.tree(query);
  }

  @Get('/count')
  async count(@Query() args: ValueDriversArgs) {
    return this.valuedriverService.count(args);
  }

  @Get('/:id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.valuedriverService.findOneById(id);
  }

  @Post('')
  async create(@Body() data: ValueDriverCreationInput) {
    return this.valuedriverService.create(data);
  }

  @Post('/:id')
  async save(@Param('id', new ParseIntPipe()) id: number, @Body() data: ValueDriverInput) {
    return this.valuedriverService.save(id, data);
  }

  @ApiBody({ type: [ValueDriverInput] })
  @Post('/bulk')
  async saveMany(@Body() data: ValueDriverInput[]) {
    return this.valuedriverService.saveMany(data);
  }

  @Delete('/:id')
  async remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.valuedriverService.remove(id);
  }
}
