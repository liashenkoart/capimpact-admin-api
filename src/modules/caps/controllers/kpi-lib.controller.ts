import {
  Controller,
  Get,
  Post,
//  UseGuards,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
//import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
//  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';

import { KpiLibService } from '../services';
import { KpiLibInput, KpiLibCreationInput, KpiLibsArgs } from '../dto';

//@ApiBearerAuth()
@ApiTags('kpilibs')
//@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('kpilibs')
export class KpiLibController {
  constructor(private readonly kpilibService: KpiLibService) {}

  @Get('')
  async findAll(@Query() args: KpiLibsArgs) {
    return this.kpilibService.findAll(args);
  }

  @Get('/count')
  async count(@Query() args: KpiLibsArgs) {
    return this.kpilibService.count(args);
  }

  @Get('/:id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.kpilibService.findOneById(id);
  }

  @Post('')
  async create(@Body() data: KpiLibCreationInput) {
    return this.kpilibService.create(data);
  }

  @Post('/:id')
  async save(@Param('id', new ParseIntPipe()) id: number, @Body() data: KpiLibInput) {
    return this.kpilibService.save(id, data);
  }

  @ApiBody({ type: [KpiLibInput] })
  @Post('/bulk')
  async saveMany(@Body() data: KpiLibInput[]) {
    return this.kpilibService.saveMany(data);
  }

  @Delete('/:id/capability-lib/:capability_lib_id')
  async removeKpiLibs(
    @Param('id', new ParseIntPipe()) id: number,
    @Param('capability_lib_id', new ParseIntPipe()) capability_lib_id: number
  ) {
    return this.kpilibService.removeCapabilityLib(id, capability_lib_id);
  }

  @Delete('/:id')
  async remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.kpilibService.remove(id);
  }
}
