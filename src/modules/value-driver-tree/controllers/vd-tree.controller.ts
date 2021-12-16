import {
    Controller,
    UseInterceptors,
    ClassSerializerInterceptor,
    Put,
    Param,
    Get,
    Body,
    Delete
  } from '@nestjs/common';
import { VDTreeService } from '../services';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('value_driver_tree')
  export class VDTreeController {
    constructor(public readonly valueDriverTreeSrv: VDTreeService) {}

    @Get('node/:id')
    node(@Param("id") id) {
      return this.valueDriverTreeSrv.getNodeWithAgreggatedKpisAndTags(id)
    }

    @Put('node/kpis/:nodeId')
    kpis(@Param('nodeId') nodeId, @Body() dto) {
      return this.valueDriverTreeSrv.updateNodeKpis(nodeId, dto)
    }

    @Put('node/tags/:nodeId')
    tags(@Param('nodeId') nodeId, @Body() dto) {
      return this.valueDriverTreeSrv.updateNodeTags(nodeId, dto)
    }

    @Put('node/technologies/:nodeId')
    technologies(@Param('nodeId') nodeId, @Body() dto) {
      return this.valueDriverTreeSrv.updateTechnologies(nodeId, dto)
    }

    @Delete(':id')
    delete(@Param('id') id) {
      return this.valueDriverTreeSrv.removeNode(id)
    }
  }
  