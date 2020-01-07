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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CompanyService } from '@modules/caps/services';
import { CompanyInput, CompanyCreationInput, CompaniesArgs } from '@modules/caps/dto';

@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('')
  async findAll(@Param() args: CompaniesArgs) {
    return this.companyService.findAll(args);
  }

  @Get('/:id')
  async findOne(@Param('id') id: number) {
    return this.companyService.findOneById(id);
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
  async save(@Param('id') id: number, @Body() data: CompanyInput) {
    return this.companyService.save(id, data);
  }

  @Post('/:id/clone')
  async clone(@Param('id') id: number, @Body() data: CompanyCreationInput, @Req() req: any) {
    return this.companyService.clone(id, data, { user: req.user });
  }

  @Delete('/:id')
  async remove(@Param('id') id: number) {
    return this.companyService.remove(+id);
  }
}
