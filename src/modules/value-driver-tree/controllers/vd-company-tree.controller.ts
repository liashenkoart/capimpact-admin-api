import {
    Controller,
    UseInterceptors,
    ClassSerializerInterceptor,
    Param,
    Post,
    Get,
    Put
  } from '@nestjs/common';
import { VDCompanyTreeService } from '../services';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('value_driver_tree/company')
  export class VDCompanyController {
    constructor(private readonly VDCompanyTree: VDCompanyTreeService) {}

    @Get('tree/:company_id')
    tree(@Param('company_id') company_id: number) {
     return this.VDCompanyTree.getVDCompanyTreeByCompanyId(company_id);
    }

    @Post('/clone/:industryOrMasterNodeId/:companyNodeId')
    clone(@Param() params) {
       return this.VDCompanyTree.clone(params)
    }

    @Put('/move/:nodeId/:parentId')
    move(@Param() params) {
      return this.VDCompanyTree.moveNode(params)
    }

  }
  