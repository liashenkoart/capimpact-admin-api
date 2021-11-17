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
  import { CapabilityTree } from './capability-tree.entity';

  @ApiBearerAuth()
  @ApiTags(CAPABILITY_TREE_API_TAG)
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller(CAPABILITY_TREE_API_TAG)
  export class CapabilityTreeController {
    constructor(private readonly capabilityTreeService: CapabilityTreeService) {}
  
    @Get('/nodes-names')
    @UseGuards(AuthGuard())
    async getCapTreeNodesNames(@Query() query) {
     return this.capabilityTreeService.getCapTreeNodesNames(query.ids);
    }

    @Get('/capabilities/:companyId')
    @UseGuards(AuthGuard())
    async getCapabilitiesByCompanyId(@Param('companyId') id) {
     return this.capabilityTreeService.getCapabilitiesByCompanyId(id);
    }
    
    @Get('industry/startups')
    @UseGuards(AuthGuard())
    async getIndustryTreeWithStartUps(@Query() query: CapabilityTreeArgs) {
      return this.capabilityTreeService.capTreeWithStartUps(query.industryId);
    }
    
    @Get('caps-by-kpi/:id')
    @UseGuards(AuthGuard())
    async getCapsByKpi(@Param('id') id: number): Promise<CapabilityTree[]>  {
      return this.capabilityTreeService.getCapsByKpi(id);
    }

    @Get('master/excell/:id')
    async check( @Param('id', new ParseIntPipe()) id: number,@Res() res) {
      return this.capabilityTreeService.nodeExcellToMater(id, res);
    }

    @Get('industry/excell/:id')
    async check2( @Param('id', new ParseIntPipe()) id: number,@Res() res) {
      return this.capabilityTreeService.nodeExcellToIndustry(id, res);
    }

    @Get('')
    @UseGuards(AuthGuard())
    async findAll(@Query() query: CapabilityTreeArgs) {
      return this.capabilityTreeService.findAll(query);
    }
  
    @Get('tree')
    @UseGuards(AuthGuard())
    async tree(@Query() query: CapabilityTreeArgs) {
      return this.capabilityTreeService.tree(query);
    }
   
    // Industry
    @Get('industry')
    @UseGuards(AuthGuard())
    async getIndustryTree(@Query() query: CapabilityTreeArgs) {
      return this.capabilityTreeService.treeByIndustryTree(query.industryId);
    }

    @Get('clonning-status')
    @UseGuards(AuthGuard())
    async clonicloningIndustryToCompanyNode(@Query() query) {
      return this.capabilityTreeService.getCloningStatus(query);
    }

    @Post('industry')
    @UseGuards(AuthGuard())
    async createIndustry(@Body() data, @Res() res) {
      return this.capabilityTreeService.createIndustry(data,res);
    }
  
    @Post('tags/:id')
    @UseGuards(AuthGuard())
    async saveTags(@Param('id') id: string, @Body() data) {
      return this.capabilityTreeService.updateTags(id, data);
    }
  
    @Get('tags/:id')
    @UseGuards(AuthGuard())
    async tags(@Param('id') id: string) {
      return this.capabilityTreeService.getTags(id);
    }
  
    @Get('technologies/:id')
    @UseGuards(AuthGuard())
    async getTechnologies(@Param('id') id: string): Promise<any> {
      return this.capabilityTreeService.getTechs(id);
    }
  
    @Post('technologies/:id')
    @UseGuards(AuthGuard())
    async saveTechnologies(@Param('id') id: string,@Body() data:SaveCapTreeTechsDto) {
      return this.capabilityTreeService.updateTechs(id,data)
    }
  
    @Post('industry/clone')
    @UseGuards(AuthGuard())
    async cloneIndustry(@Body() data: CapabilityTreeIndustryCloneInput) {
      return this.capabilityTreeService.cloneIndustry(data);
    }
  
    @Post('industry/:id')
    @UseGuards(AuthGuard())
    async updateIndustry(
      @Param('id', new ParseIntPipe()) id: number,
      @Body() data: CapabilityTreeIndustryCreationInput
      ) {
      return this.capabilityTreeService.updateIndustry(id, data);
    }

    @Get('company')
    @UseGuards(AuthGuard())
    async getCompanyTree(@Query() query: CapabilityTreeArgs) {
      return this.capabilityTreeService.treeByCompanyTree(query.company_id);
    }

    @Get('company/tags')
    @UseGuards(AuthGuard())
    async getCompanyTreeWithTgas(@Query() query: CapabilityTreeArgs) {
      return this.capabilityTreeService.treeByCompanyTreeWithTags(query.company_id);
    }
  
    @Get('location/:id')
    @UseGuards(AuthGuard())
    async getLocation(@Param('id') id: string): Promise<CapabilityTreeLocationDto> {
      return this.capabilityTreeService.getLocation(id);
    }
  
    @Post('location')
    @UseGuards(AuthGuard())
    async saveLocation(@Body() data: CapabilityTreeLocationDto) {
      return this.capabilityTreeService.saveLocation(data)
    }
  
    @Post('company')
    @UseGuards(AuthGuard())
    async createCompany(@Body() data: CapabilityTreeIndustryCreationInput, @Res() res) {
      return this.capabilityTreeService.createCompany(data,res);
    }
  
    @Post('company/:id')
    @UseGuards(AuthGuard())
    async updateCompany(
      @Param('id', new ParseIntPipe()) id: number,
      @Body() data: CapabilityTreeIndustryCreationInput
      ) {
      return this.capabilityTreeService.updateCompany(id, data);
    }
  
    // Master Captree
    @Get('master')
    @UseGuards(AuthGuard())
    async findMasterCapTree() {
      return this.capabilityTreeService.findMasterCapTree();
    }

  
    @Post('master')
    @UseGuards(AuthGuard())
    async createMaster(@Body() data: CapabilityTreeCreationInput, @Req() req: any) {
      return this.capabilityTreeService.createMaster(data);
    }
  
    @Post('master/:id')
    @UseGuards(AuthGuard())
    async updateMaster(
      @Param('id', new ParseIntPipe()) id: number,
      @Body() data: UpdateCapabilityTreeNode,
    ) {
      return this.capabilityTreeService.updateTreeStructure(id, data);
    }
  
    @Post('tree/:id')
    @UseGuards(AuthGuard())
    async updateTree(
      @Param('id', new ParseIntPipe()) id: number,
      @Body() data: UpdateCapabilityTreeNode,
    ) {
      return this.capabilityTreeService.updateTreeStructure(id, data);
    }
  
    @Post('kpi')
    @UseGuards(AuthGuard())
    async createKpi(
      @Body() data: UpdateCapabilityTreeNode ,
    ) {
      return this.capabilityTreeService.createKpi(data);
    }

    @Get('/unselect/:id')
    @UseGuards(AuthGuard())
    async removeOneCapTree(@Param('id', new ParseIntPipe()) id: number) {
      return this.capabilityTreeService.removeOneCapTree(id);
    }
  
    @Get('/:id')
    @UseGuards(AuthGuard())
    async findOne(@Param('id', new ParseIntPipe()) id: number) {
      return this.capabilityTreeService.findOneById(id);
    }
  
    @Post('')
    @UseGuards(AuthGuard())
    async create(@Body() data: CapabilityTreeCreationInput, @Req() req: any) {
      return this.capabilityTreeService.create(data);
    }

    @Post('/:id')
    @UseGuards(AuthGuard())
    async save(
      @Param('id', new ParseIntPipe()) id: number,
      @Body() data: UpdateCapabilityTreeNode ,
      @Req() req: any
    ) {
      return this.capabilityTreeService.save(id, data);
    }
    
    @Delete('/switch/:id')
    @UseGuards(AuthGuard())
    async switch(
      @Param('id', new ParseIntPipe()) id: number,
      @Body() data: any, 
    ){
      return this.capabilityTreeService.switch(id, data);
    }
  
  
    @Delete('/delete_many')
    @UseGuards(AuthGuard())
    // TODO: CREATE DELETION DTO
    async delete_many(@Body() data: any) {
      return this.capabilityTreeService.delete_many(data.capIds);
    }
  
    @Delete(':id')
    @UseGuards(AuthGuard())
    async remove(@Param('id', new ParseIntPipe()) id: number) {
      return this.capabilityTreeService.remove(id);
    }
  
    @Delete('delete/:id')
    @UseGuards(AuthGuard())
    async remove_from_captree(@Param('id', new ParseIntPipe()) id: number) {
      return this.capabilityTreeService.remove_from_captree(id);
    }
  }
  