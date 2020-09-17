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
import { CapabilityTreesArgs, CapabilityTreeInput, CapabilityTreeCreationInput, CapabilityTreeIndustryCloneInput,CapabilityTreeLocationDto } from '../dto';
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

  // Industry
  @Get('industry')
  async getIndustryTree(@Query() query: CapabilityTreeArgs) {
    return this.capabilityTreeService.treeByIndustryTree(query.industryId);
  }

  @Post('industry')
  async createIndustry(@Body() data: CapabilityTreeIndustryCreationInput) {
    return this.capabilityTreeService.createIndustry(data);
  }

  @Post('tags/:id')
  async saveTags(@Param('id') id: string, @Body() data) {
    return this.capabilityTreeService.updateTags(id, data);
  }

  @Get('tags/:id')
  async tags(@Param('id') id: string) {
    return this.capabilityTreeService.getTags(id);
  }

  @Post('industry/clone')
  async cloneIndustry(@Body() data: CapabilityTreeIndustryCloneInput) {
    console.log("CapabilityTreeController -> cloneIndustry -> data", data)
    return this.capabilityTreeService.cloneIndustry(data);
  }

  @Post('industry/:id')
  async updateIndustry(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: CapabilityTreeIndustryCreationInput
    ) {
    return this.capabilityTreeService.updateIndustry(id, data);
  }

  @Post('industry/tree/:id')
  async updateIndustryTree(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: CapabilityTreeIndustryCreationInput
    ) {
    return this.capabilityTreeService.updateIndustryTree(id, data);
  }

  // COMPANY
  @Get('company')
  async getCompanyTree(@Query() query: CapabilityTreeArgs) {
    return this.capabilityTreeService.treeByCompanyTree(query.company_id);
  }

  @Get('location/:id')
  async getLocation(@Param('id') id: string): Promise<CapabilityTreeLocationDto> {
    return this.capabilityTreeService.getLocation(id);
  }

  @Post('location')
  async saveLocation(@Body() data: CapabilityTreeLocationDto) {
    return this.capabilityTreeService.saveLocation(data)
  }

  @Post('company')
  async createCompany(@Body() data: CapabilityTreeIndustryCreationInput) {
    return this.capabilityTreeService.createCompany(data);
  }

  @Post('company/:id')
  async updateCompany(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: CapabilityTreeIndustryCreationInput
    ) {
    return this.capabilityTreeService.updateCompany(id, data);
  }

  @Post('company/tree/:id')
  async updateCompanyTree(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: CapabilityTreeIndustryCreationInput
    ) {
    return this.capabilityTreeService.updateCompanyTree(id, data);
  }

  // Master Captree
  @Get('master')
  async findMasterCapTree() {
    return this.capabilityTreeService.findMasterCapTree();
  }

  @Post('master')
  async createMaster(@Body() data: CapabilityTreeCreationInput, @Req() req: any) {
    return this.capabilityTreeService.createMaster(data);
  }

  @Post('master/:id')
  async updateMaster(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: CapabilityTreeInput,
    @Req() req: any
  ) {
    return this.capabilityTreeService.updateMaster(id, data);
  }
  @Post('kpi')
  async createKpi(
    @Body() data: CapabilityTreeInput,
    @Req() req: any
  ) {
    return this.capabilityTreeService.createKpi(data);
  }
  @Get('/unselect/:id')
  async removeOneCapTree(@Param('id', new ParseIntPipe()) id: number) {
    return this.capabilityTreeService.removeOneCapTree(id);
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
