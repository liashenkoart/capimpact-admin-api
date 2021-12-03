import {
    Controller,
    UseInterceptors,
    ClassSerializerInterceptor,
    Put,
    Param,
    Delete,
    Post,
    Get
  } from '@nestjs/common';
import { VDMasterTreeService } from '../services';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('value_driver_tree/master')
  export class VDMasterController {
    constructor(public readonly valueDriverTreeSrv: VDMasterTreeService) {}

    @Get()
    master() {
      return this.valueDriverTreeSrv.getMasterTree()
    }

    @Post(':value_driver_lib_id')
    createNode(@Param() params) {
      return this.valueDriverTreeSrv.addNode(params)
    }

    @Put('move/:nodeId/root')
    toMasterRoot(@Param('nodeId') nodeId) {
      return this.valueDriverTreeSrv.moverToMasterRoot(nodeId)
    }

    @Put('move/:nodeId/:parentId')
    move(@Param() params) {
      return this.valueDriverTreeSrv.moveNode(params)
    }

    @Post(':value_driver_lib_id/:type')
    toggle(@Param() params) {
      return this.valueDriverTreeSrv.addNode(params)
    }

  }
  