import {
    Controller,
    UseInterceptors,
    ClassSerializerInterceptor,
    Put,
    Param,
    Get,
    Body
  } from '@nestjs/common';
import { ValueDriverTreeService } from './value-driver-tree.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('value_driver_tree')
  export class ValueDriverTreeontroller {
    constructor(private readonly valueDriverTreeSrv: ValueDriverTreeService) {}


    @Get('/master')
    master() {
      return this.valueDriverTreeSrv.getMasterTree()
    }

    @Get('/node/:id')
    node(@Param("id") id) {
      return this.valueDriverTreeSrv.getNodeWithAgreggatedKpisAndTags(id)
    }

    @Put('master/move/:nodeId/root')
    toMasterRoot(@Param('nodeId') nodeId) {
      return this.valueDriverTreeSrv.moverToMasterRoot(nodeId)
    }

    @Put('master/node/kpis/:nodeId')
    kpis(@Param('nodeId') nodeId, @Body() dto) {
      return this.valueDriverTreeSrv.updateNodeKpis(nodeId, dto)
    }

    @Put('master/move/:nodeId/:parentId')
    move(@Param() params) {
      return this.valueDriverTreeSrv.moveNode(params)
    }

    @Put(':value_driver_lib_id/:type')
    toggle(@Param() params) {
      return this.valueDriverTreeSrv.toggleNode(params)
    }

  
  }
  