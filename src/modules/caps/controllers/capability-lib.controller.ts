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

import { CapabilityLibService } from '../services';
import { CapabilityLibsArgs, CapabilityLibInput, CapabilityLibCreationInput } from '../dto';

@ApiBearerAuth()
@ApiTags('capability-libs')
@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('capability-libs')
export class CapabilityLibController {
  constructor(private readonly capabilityLibService: CapabilityLibService) {}

  @Get('')
  async findAll(@Query() query: CapabilityLibsArgs) {
    return this.capabilityLibService.findAll(query);
  }
  @Get('/count')
  async count(@Query() query: CapabilityLibsArgs) {
    return this.capabilityLibService.count(query);
  }

  @Get('/:id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.capabilityLibService.findOneById(id);
  }

  @Post('')
  async create(@Body() data: CapabilityLibCreationInput, @Req() req: any) {
    return this.capabilityLibService.create(data);
  }

  @Post('/:id')
  async save(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: CapabilityLibInput,
    @Req() req: any
  ) {
    return this.capabilityLibService.save(id, data);
  }

  @Delete('/:id/kpi-lib/:kpi_lib_id')
  async removeKpiLibs(
    @Param('id', new ParseIntPipe()) id: number,
    @Param('kpi_lib_id', new ParseIntPipe()) kpi_lib_id: number
    ) {
    return this.capabilityLibService.removeKpiLib(id, kpi_lib_id);
  }

  @Delete('/:id')
  async remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.capabilityLibService.remove(id);
  }
}
