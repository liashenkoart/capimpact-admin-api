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
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { IndustryService } from '../services';
import { IndustryInput, IndustryCreationInput, IndustriesArgs } from '../dto';

@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('industries')
export class IndustryController {
  constructor(
    private readonly industryService: IndustryService //@Inject(CACHE_MANAGER) private cacheManager
  ) {}

  @Get('')
  async findAll(@Param() args: IndustriesArgs) {
    return this.industryService.findAll(args);
  }

  @Get('/:id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.industryService.findOneById(id);
  }

  @Post('')
  async create(@Body() data: IndustryCreationInput, @Req() req: any) {
    return this.industryService.create(data, { user: req.user });
  }

  @Post('/:id')
  async save(@Param('id', new ParseIntPipe()) id: number, @Body() data: IndustryInput) {
    return this.industryService.save(id, data);
  }

  @Post('/:id/clone')
  async clone(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: IndustryCreationInput,
    @Req() req: any
  ) {
    return this.industryService.clone(id, data, { user: req.user });
  }

  @Delete('/:id')
  async remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.industryService.remove(+id);
  }
}
