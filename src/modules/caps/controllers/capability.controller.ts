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

import { CapabilityService } from '../services';
import { CapabilitiesArgs, CapabilityInput, CapabilityCreationInput } from '../dto';

@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('capabilities')
export class CapabilityController {
  constructor(private readonly capabilityService: CapabilityService) {}

  @Get('')
  async findAll(@Query() query: CapabilitiesArgs) {
    return this.capabilityService.findAll(query);
  }

  @Get('tree')
  async tree(@Query() query: CapabilitiesArgs) {
    return this.capabilityService.tree(query);
  }

  @Get('/:id')
  async findOne(@Param('id') id: number) {
    return this.capabilityService.findOneById(id);
  }

  @Post('')
  async create(@Body() data: CapabilityCreationInput, @Req() req: any) {
    return this.capabilityService.create(data, { user: req.user });
  }

  @Post('/bulk')
  async saveMany(@Body() data: CapabilityInput[], @Req() req: any) {
    return this.capabilityService.saveMany(data, { user: req.user });
  }

  @Post('/:id')
  async save(@Param('id') id: number, @Body() data: CapabilityInput, @Req() req: any) {
    return this.capabilityService.save(id, data, { user: req.user });
  }

  @Delete('/:id')
  async remove(@Param('id') id: number) {
    return this.capabilityService.remove(id);
  }
}
