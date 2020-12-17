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
    Res,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
  import { CapabilityTreeService } from './capability-tree.service';
  import { CapabilityTreeArgs, UpdateCapabilityTreeNode, CapabilityTreeCreationInput, CapabilityTreeIndustryCloneInput,CapabilityTreeLocationDto } from './dto';
  import { CapabilityTreeIndustryCreationInput } from './dto/capability-tree-industry-creation.dto';
  import { SaveCapTreeTechsDto } from "./dto";
  import { CAPABILITY_TREE_API_TAG } from "./capability-tree.constants"

  @ApiBearerAuth()
  @ApiTags(CAPABILITY_TREE_API_TAG)
  // @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller(CAPABILITY_TREE_API_TAG)
  export class CapabilityTreeController {
    constructor(private readonly capabilityTreeService: CapabilityTreeService) {}
  
    @Get('master/excell/:id')
    async check( @Param('id', new ParseIntPipe()) id: number,@Res() res) {
      return this.capabilityTreeService.nodeExcellTo(id, res);
    }

    @Get('')
    async findAll(@Query() query: CapabilityTreeArgs) {
      return this.capabilityTreeService.findAll(query);
    }
  
    @Get('tree')
    async tree(@Query() query: CapabilityTreeArgs) {
      return this.capabilityTreeService.tree(query);
    }
  
    // Industry
    @Get('industry')
    async getIndustryTree(@Query() query: CapabilityTreeArgs) {
      return this.capabilityTreeService.treeByIndustryTree(query.industryId);
    }

    @Get('clonning-status')
    async clonicloningIndustryToCompanyNode(@Query() query) {
      return this.capabilityTreeService.getCloningStatus(query);
    }

    @Post('industry')
    async createIndustry(@Body() data, @Res() res) {
      return this.capabilityTreeService.createIndustry(data,res);
    }
  
    @Post('tags/:id')
    async saveTags(@Param('id') id: string, @Body() data) {
      return this.capabilityTreeService.updateTags(id, data);
    }
  
    @Get('tags/:id')
    async tags(@Param('id') id: string) {
      return this.capabilityTreeService.getTags(id);
    }
  
    @Get('technologies/:id')
    async getTechnologies(@Param('id') id: string): Promise<any> {
      return this.capabilityTreeService.getTechs(id);
    }
  
    @Post('technologies/:id')
    async saveTechnologies(@Param('id') id: string,@Body() data:SaveCapTreeTechsDto) {
      return this.capabilityTreeService.updateTechs(id,data)
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
  
    // COMPANY
    @Get('company')
    async getCompanyTree(@Query() query: CapabilityTreeArgs) {
      return this.capabilityTreeService.treeByCompanyTree(query.company_id);
    }

    @Get('company/tags')
    async getCompanyTreeWithTgas(@Query() query: CapabilityTreeArgs) {
      return this.capabilityTreeService.treeByCompanyTreeWithTags(query.company_id);
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
    async createCompany(@Body() data: CapabilityTreeIndustryCreationInput, @Res() res) {
      return this.capabilityTreeService.createCompany(data,res);
    }
  
    @Post('company/:id')
    async updateCompany(
      @Param('id', new ParseIntPipe()) id: number,
      @Body() data: CapabilityTreeIndustryCreationInput
      ) {
      return this.capabilityTreeService.updateCompany(id, data);
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
      @Body() data: UpdateCapabilityTreeNode,
    ) {
      return this.capabilityTreeService.updateTreeStructure(id, data);
    }
  
    @Post('tree/:id')
    async updateTree(
      @Param('id', new ParseIntPipe()) id: number,
      @Body() data: UpdateCapabilityTreeNode,
    ) {
      return this.capabilityTreeService.updateTreeStructure(id, data);
    }
  
    @Post('kpi')
    async createKpi(
      @Body() data: UpdateCapabilityTreeNode ,
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
      @Body() data: UpdateCapabilityTreeNode ,
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
  