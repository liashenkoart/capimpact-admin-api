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
  Res,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { CompanyGraphService } from './services';

import { CompanyService } from './services/company.service';
import { CompanyInput, CompanyCreationInput, CompaniesArgs } from './dto';
import { COMPANY_API_TAG } from './company.constants';

@ApiBearerAuth()
@ApiTags(COMPANY_API_TAG)
@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller(COMPANY_API_TAG)
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly companyGraphService: CompanyGraphService
  ) {}

  @Get('/count')
  async count() {
    return this.companyService.count();
  }

  @Get('')
  async findAll(@Query() args: CompaniesArgs) {
    return this.companyService.findAll(args);
  }

  @Get('/:id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.companyService.findOneById(id);
  }

  @Get('minerva/:id')
  async findByMinervaProject(@Param('id', new ParseIntPipe()) id: number) {
    return this.companyService.getOneByMinervaProjectWithIndustryTrees(id);
  }

  @Get(`/:cid/partner-networks`)
  async findPartnerNetworksByCid(@Param('cid') cid: string) {
    return this.companyGraphService.findPartnerNetworksByCid(cid);
  }

  @Get(`/graph/:cid/partner-networks`)
  async findPartnerNetworksForGraphByCid(@Req() hps: any, @Param('cid') cid: string) {
    return this.companyGraphService.findPartnerNetworksForGraphByCid(cid, hps);
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
  async create(@Body() data: CompanyCreationInput, @Req() req: any, @Res() res) {
    return this.companyService.create(data, { user: req.user }, res);
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
    @Req() req: any,
    @Res() res
  ) {
    return this.companyService.clone(id, data, { user: req.user }, res);
  }

  @Delete('/:id')
  async remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.companyService.remove(+id);
  }

  @Get(`/graph/:cid/summary-stats-by-industries`)
  async getSummaryStatsByIndustries(@Param('cid') cid: string) {
    return this.companyGraphService.getSummaryStatsByIndustries(cid, true);
  }

  @Get(`/graph/:cid/summary-stats-by-industries/all`)
  async getSummaryStatsByIndustriesAll(@Param('cid') cid: string) {
    return this.companyGraphService.getSummaryStatsByIndustries(cid, false);
  }

  @Get(`/graph/:cid/summary-stats-by-capability`)
  async getSummaryStatsByCapabilities(@Param('cid') cid: string) {
    return this.companyGraphService.getSummaryStatsByCapabilities(cid, true);
  }

  @Get(`/graph/:cid/summary-stats-by-capability/all`)
  async getSummaryStatsByCapabilitiesAll(@Param('cid') cid: string) {
    return this.companyGraphService.getSummaryStatsByCapabilities(cid, false);
  }

  @Get(`/graph/:cid/shared-companies`)
  async getSharedCompanies(@Param('cid') cid: string) {
    return this.companyGraphService.getSharedCompanies(cid);
  }
}
