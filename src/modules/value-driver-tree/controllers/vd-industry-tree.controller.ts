import {
    Controller,
    UseInterceptors,
    ClassSerializerInterceptor,
    Put,
    Param,
    Get,
    Body,
    Delete,
    Post
  } from '@nestjs/common';
import { VDIndustryTree } from '../services';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('value_driver_tree/industry')
  export class VDIndustryController {
    constructor(private readonly VDIndustryTree: VDIndustryTree) {}

    @Get('/tree/:industry_tree_id')
    node(@Param("industry_tree_id") industry_tree_id) {
      return this.VDIndustryTree.getVDIndustryTreeByIndustryId(industry_tree_id)
    }

    @Get('/clone/:masterNodeId/:industryNodeId')
    clone(@Param() params) {
      return this.VDIndustryTree.cloneMasterToIndustry(params)
    }
    

  }
  