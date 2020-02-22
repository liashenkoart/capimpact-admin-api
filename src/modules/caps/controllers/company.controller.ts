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

import { CompanyService } from '../services';
import { CompanyInput, CompanyCreationInput, CompaniesArgs } from '../dto';
import { Neo4jService } from '@modules/neo4j/services';

@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('companies')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly neo4jService: Neo4jService
  ) {}

  @Get('')
  async findAll(@Param() args: CompaniesArgs) {
    return this.companyService.findAll(args);
  }

  @Get('/:id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.companyService.findOneById(id);
  }

  @Get('/:cid/partner-networks')
  async findPartnerNetworksByCid(@Param('cid') cid: string) {
    return this.neo4jService.findPartnerNetworksByCid(cid);
  }

  @Post('')
  async create(@Body() data: CompanyCreationInput, @Req() req: any) {
    return this.companyService.create(data, { user: req.user });
  }

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

  @Delete('/:id')
  async remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.companyService.remove(+id);
  }
}
