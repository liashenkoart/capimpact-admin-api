import {
    Controller,
    UseInterceptors,
    ClassSerializerInterceptor,
    Put,
    Param,
    Get
  } from '@nestjs/common';
import { ValueDriverTreeService } from './value-driver-tree.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('value_driver_tree')
  export class ValueDriverTreeontroller {
    constructor(private readonly valueDriverTreeSrv: ValueDriverTreeService) {}


    @Get('/master')
    master(@Param() params) {
      return this.valueDriverTreeSrv.getMasterTree()
    }

    @Put('master/move/:nodeId/root')
    toMasterRoot(@Param('nodeId') nodeId) {
      return this.valueDriverTreeSrv.moverToMasterRoot(nodeId)
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
  