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
  ParseIntPipe, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import {CompanyGraphService} from "@modules/caps/services/company.graph.service";

import { CompanyService } from '../services';
import { CompanyInput, CompanyCreationInput, CompaniesArgs } from '../dto';

@ApiBearerAuth()
@ApiTags('companies')
@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('companies')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly companyGraphService: CompanyGraphService,
  ) {}

  @Get('')
  async findAll(@Query() args: CompaniesArgs) {
    return this.companyService.findAll(args);
  }

  @Get('/:id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.companyService.findOneById(id);
  }

  @Get(`/:cid/partner-networks`)
  async findPartnerNetworksByCid(
    @Req() hps: any,
    @Param('cid') cid: string,
    )
  {
    return this.companyGraphService.findPartnerNetworksByCid(cid, hps);
  }

  @Get('/partner-networks/:cid')
  async findOnePartnerNetworkByCid(@Param('cid') cid: string) {
    return this.companyGraphService.findOnePartnerNetworkByCid(cid);
  }

  @Post('/:cid/capabilities')
  async saveCompanyCapabilitiesByCid(@Param('cid') cid: string, @Body() data: CompanyInput) {
    return this.companyGraphService.saveCompanyCapabilitiesByCid(cid, data);
  }

  @Post('')
  async create(@Body() data: CompanyCreationInput, @Req() req: any) {
    return this.companyService.create(data, { user: req.user });
  }

  @ApiBody({ type: [CompanyInput] })
  @Post('/bulk')
  async saveMany(@Body() data: CompanyInput[], @Req() req: any) {
    return this.companyService.saveMany(data, { user: req.user });
  }

  @Post('/:id')
  async save(@Param('id', new ParseIntPipe()) id: number, @Body() data: CompanyInput) {
    return this.companyService.save(id, data);
  }

  @Post('/:id/clone')
  async clone(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: CompanyInput,
    @Req() req: any
  ) {
    return this.companyService.clone(id, data, { user: req.user });
  }

  @Delete('/:id/industry-tree/:industry_tree_id')
  async removeKpiLibs(
    @Param('id', new ParseIntPipe()) id: number,
    @Param('industry_tree_id', new ParseIntPipe()) industry_tree_id: number
  ) {
    return this.companyService.removeIndustryTree(id, industry_tree_id);
  }

  @Delete('/:id')
  async remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.companyService.remove(+id);
  }

  @Get(`/:cid/summary-stats-by-industries`)
  async getSummaryStatsByIndustries(@Param('cid') cid: string) {
    return this.companyGraphService.getSummaryStatsByIndustries(cid, true);
  }

  @Get(`/:cid/summary-stats-by-industries/all`)
  async getSummaryStatsByIndustriesAll(@Param('cid') cid: string) {
    return this.companyGraphService.getSummaryStatsByIndustries(cid, false);
  }

  @Get(`/:cid/summary-stats-by-capability`)
  async getSummaryStatsByCapabilities(@Param('cid') cid: string) {
    return this.companyGraphService.getSummaryStatsByCapabilities(cid, true);
  }

  @Get(`/:cid/summary-stats-by-capability/all`)
  async getSummaryStatsByCapabilitiesAll(@Param('cid') cid: string) {
    return this.companyGraphService.getSummaryStatsByCapabilities(cid, false);
  }
}
