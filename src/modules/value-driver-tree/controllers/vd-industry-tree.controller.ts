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

    @Get('/clone/info/:industry_tree_id')
    createNode(@Param('industry_tree_id') industry_tree_id) {
      return this.VDIndustryTree.clonedCouple(industry_tree_id)
    }

    @Put('/clone/:masterNodeId/:industryNodeId')
    clone(@Param() params) {
      return this.VDIndustryTree.cloneMasterToIndustry(params)
    }

    @Put('move/:nodeId/:parentId')
    move(@Param() params) {
      return this.VDIndustryTree.moveNode(params)
    }
    
    @Put('name/:nodeId')
    updateName(@Body() dto, @Param('nodeId') nodeId) {
      return this.VDIndustryTree.updateNodeName(dto,nodeId)
    }
  }
  