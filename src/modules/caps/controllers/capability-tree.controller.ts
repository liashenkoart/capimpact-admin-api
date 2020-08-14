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

import { CapabilityTreeService } from '../services';
import { CapabilityTreesArgs, CapabilityTreeInput, CapabilityTreeCreationInput } from '../dto';
import { CapabilityTreeIndustryCreationInput } from '../dto/capability-tree-industry-creation.dto';
import { CapabilityTreeArgs } from '../dto/capability-tree.args';

@ApiBearerAuth()
@ApiTags('capability-trees')
@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('capability-trees')
export class CapabilityTreeController {
  constructor(private readonly capabilityTreeService: CapabilityTreeService) {}

  @Get('')
  async findAll(@Query() query: CapabilityTreesArgs) {
    return this.capabilityTreeService.findAll(query);
  }

  @Get('tree')
  async tree(@Query() query: CapabilityTreesArgs) {
    return this.capabilityTreeService.tree(query);
  }

  // Master
  @Get('master')
  async findMasterCapTree() {
    return this.capabilityTreeService.findMasterCapTree();
  }

  // Industry
  @Get('industry')
  async getIndustryTree(@Query() query: CapabilityTreeArgs) {
    return this.capabilityTreeService.treeByIndustryTree(query.industryId);
  }
  @Post('industry')
  async createIndustry(@Body() data: CapabilityTreeIndustryCreationInput) {
    return this.capabilityTreeService.createIndustry(data);
  }

  @Get('/unselect/:id')
  async unselectCapTree(@Param('id', new ParseIntPipe()) id: number) {
    return this.capabilityTreeService.unselectCapTree(id);
  }

  @Get('/:id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.capabilityTreeService.findOneById(id);
  }

  @Post('')
  async create(@Body() data: CapabilityTreeCreationInput, @Req() req: any) {
    return this.capabilityTreeService.create(data);
  }

  @Post('/:id')
  async save(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: CapabilityTreeInput,
    @Req() req: any
  ) {
    return this.capabilityTreeService.save(id, data);
  }
  
  @Delete('/switch/:id')
  async switch(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: any, 
  ){
    return this.capabilityTreeService.switch(id, data);
  }


  @Delete('/delete_many')
  // TODO: CREATE DELETION DTO
  async delete_many(@Body() data: any) {
    return this.capabilityTreeService.delete_many(data.capIds);
  }

  @Delete(':id')
  async remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.capabilityTreeService.remove(id);
  }

  @Delete('delete/:id')
  async remove_from_captree(@Param('id', new ParseIntPipe()) id: number) {
    return this.capabilityTreeService.remove_from_captree(id);
  }
}
