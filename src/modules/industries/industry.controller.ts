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
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { IndustryService } from '@modules/industries/industry.service';
import { IndustryInput, IndustryCreationInput } from '@modules/industries/dto';

@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('industries')
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  @Get('')
  async findAll() {
    return this.industryService.findAll();
  }

  @Get('/:id')
  async findOne(@Param('id') id: number) {
    return this.industryService.findById(id);
  }

  @Post('')
  async create(@Body() data: IndustryCreationInput) {
    return this.industryService.create(data);
  }

  @Post('/processes')
  async createWithTreeProcesses(@Body() data: IndustryCreationInput, @Req() req: any) {
    return this.industryService.createWithTreeProcesses(data, { user: req.user });
  }

  @Post('/:id')
  async save(@Param('id') id: number, @Body() data: IndustryInput) {
    return this.industryService.save(id, data);
  }

  @Delete('/:id')
  async remove(@Param('id') id: number) {
    return this.industryService.remove(id);
  }
}
