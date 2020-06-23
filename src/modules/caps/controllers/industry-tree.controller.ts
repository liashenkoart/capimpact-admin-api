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

import { IndustryTreeService } from '../services';
import { IndustryTreesArgs, IndustryTreeInput, IndustryTreeCreationInput } from '../dto';

@ApiBearerAuth()
@ApiTags('industry-tree')
@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('industry-tree')
export class IndustryTreeController {
  constructor(private readonly industryTreeService: IndustryTreeService) {}

  @Get('')
  async findAll(@Query() query: IndustryTreesArgs) {
    return this.industryTreeService.findAll(query);
  }

  @Get('tree')
  async tree(@Query() query: IndustryTreesArgs) {
    return this.industryTreeService.tree(query);
  }

  @Get('tree/:code')
  async treeByCode(@Param('code') code: string) {
    return this.industryTreeService.treeByCode(code);
  }

  @Get('/:id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.industryTreeService.findOneById(id);
  }

  @Post('')
  async create(@Body() data: IndustryTreeCreationInput, @Req() req: any) {
    return this.industryTreeService.create(data);
  }

  @Post('/:id')
  async save(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: IndustryTreeInput,
    @Req() req: any
  ) {
    return this.industryTreeService.save(id, data);
  }

  @Delete('/:id')
  async remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.industryTreeService.remove(id);
  }
}
