import {
    Controller,
    UseInterceptors,
    ClassSerializerInterceptor,
    Param,
    Post,
    Get,
    Put,
    Body
  } from '@nestjs/common';
import { VDCompanyTreeService } from '../services';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('value_driver_tree/company')
  export class VDCompanyController {
    constructor(private readonly VDCompanyTree: VDCompanyTreeService) {}

    @Get(':company_id')
    tree(@Param('company_id') company_id: number) {
     return this.VDCompanyTree.getVDCompanyTreeByCompanyId(company_id);
    }

    @Get('/clone/:companyNodeId/:industryOrMasterNodeId')
    clone(@Param() params) {
       return this.VDCompanyTree.clone(params)
    }

    @Post('/move/:fromId/:toId')
    move(@Param() params) {
    
    }

  }
  