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
  
  import { IndustryTreeService } from './industry-tree.service';
  import { IndustryTreesArgs, IndustryTreeInput, IndustryTreeCreationInput } from './dto';
  import { INDUSTRY_TREE_API_TAG } from './industry-tree.constants'

  @ApiBearerAuth()
  @ApiTags(INDUSTRY_TREE_API_TAG)
  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller(INDUSTRY_TREE_API_TAG)
  export class IndustryTreeController {
    constructor(private readonly industryTreeService: IndustryTreeService) {}
  
    
    @Get('')
    async findAll(@Query() query: IndustryTreesArgs) {
      return this.industryTreeService.findAll(query);
    }
  
    @Get('six-digits-industries')
    async sixDigitsIndustries() {
      return this.industryTreeService.findSixDigitsCodeIndustries();
    }
  
    @Get('tree')
    async tree() {
      return this.industryTreeService.tree();
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
  
    @Delete('/:id/company/:company_id')
    async removeKpiLibs(
      @Param('id', new ParseIntPipe()) id: number,
      @Param('company_id', new ParseIntPipe()) company_id: number
    ) {
      return this.industryTreeService.removeCompany(id, company_id);
    }
  
    @Delete('/:id')
    async remove(@Param('id', new ParseIntPipe()) id: number) {
      return this.industryTreeService.remove(id);
    }
  }
  