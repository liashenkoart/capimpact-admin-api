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
import { VDMasterTree } from '../services';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('value_driver_tree')
  export class VDMasterController {
    constructor(private readonly valueDriverTreeSrv: VDMasterTree) {}

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

    @Put('master/node/tags/:nodeId')
    tags(@Param('nodeId') nodeId, @Body() dto) {
      return this.valueDriverTreeSrv.updateNodeTags(nodeId, dto)
    }

    @Put('master/move/:nodeId/:parentId')
    move(@Param() params) {
      return this.valueDriverTreeSrv.moveNode(params)
    }

    @Post(':value_driver_lib_id/:type')
    toggle(@Param() params) {
      return this.valueDriverTreeSrv.addNode(params)
    }

    @Delete(':id')
    delete(@Param('id') id) {
      return this.valueDriverTreeSrv.removeNode(id)
    }

  }
  