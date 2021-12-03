import {
    Controller,
    UseInterceptors,
    ClassSerializerInterceptor,
    Param,
    Get,
    Put,
    Body
  } from '@nestjs/common';
import { VDIndustryTreeService } from '../services';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('value_driver_tree/industry')
  export class VDIndustryController {
    constructor(private readonly VDIndustryTree: VDIndustryTreeService) {}

    @Get('/tree/:industry_tree_id')
    node(@Param("industry_tree_id") industry_tree_id) {
      return this.VDIndustryTree.getVDIndustryTreeByIndustryId(industry_tree_id)
    }

    @Put('/clone/:masterNodeId/:industryNodeId')
    clone(@Param() params) {
      return this.VDIndustryTree.cloneMasterToIndustry(params)
    }

    @Put('name/:nodeId')
    move(@Body() dto, @Param('nodeId') nodeId) {
      return this.VDIndustryTree.updateNodeName(dto,nodeId)
    }
  }
  