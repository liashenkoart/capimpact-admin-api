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
import { ApiTags, ApiBearerAuth, ApiCreatedResponse, ApiBody } from '@nestjs/swagger';

import { StartupService } from '../services';
import { StartupInput, StartupCreationInput, StartupsArgs } from '../dto';

@ApiBearerAuth()
@ApiTags('startups')
@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('startups')
export class StartupController {
  constructor(private readonly startupService: StartupService) {}

  @Get('')
  async findAll(@Query() args: StartupsArgs) {
    return this.startupService.findAll(args);
  }

  @Get('/count')
  async count(@Query() args: StartupsArgs) {
    return this.startupService.count(args);
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return this.startupService.findOneById(id);
  }

  @Post('')
  async create(@Body() data: StartupCreationInput) {
    return this.startupService.create(data);
  }

  @Post('/:id')
  async save(@Param('id') id: string, @Body() data: StartupInput) {
    return this.startupService.save(id, data);
  }

  @Post('tags/:id')
  async saveTags(@Param('id') id: string, @Body() data) {
    return this.startupService.updateTages(id, data);
  }

  @ApiBody({ type: [StartupInput] })
  @Post('/bulk')
  async saveMany(@Body() data: StartupInput[]) {
    return this.startupService.saveMany(data);
  }

  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return this.startupService.remove(id);
  }
}
