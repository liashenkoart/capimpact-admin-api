import {
    Controller,
    Get,
    Post,
    UseGuards,
    Body,
    UseInterceptors,
    ClassSerializerInterceptor,
    Param,
    Delete,
    Query,
    ParseIntPipe,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { ApiTags, ApiBody } from '@nestjs/swagger';
  
  import { ValueDriverService } from './value-driver.service';
  import { ValueDriverInput, ValueDriverCreationInput, ValueDriversArgs } from './dto';
  import { VALUE_DRIVER_API_TAG} from './value-driver.constants';


  @ApiTags(VALUE_DRIVER_API_TAG)
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller(VALUE_DRIVER_API_TAG)
  export class ValueDriverController {
    constructor(private readonly valuedriverService: ValueDriverService) {}
  
    @Get('tree')
    async tree(@Query() query: ValueDriversArgs) {
      return this.valuedriverService.tree(query);
    }
  
    @Get('tags/:id')
    async tags(@Param('id') id: string) {
      return this.valuedriverService.getTags(id);
    }
  
    @Post('tags/:id')
    async saveTags(@Param('id') id: string, @Body() data) {
      return this.valuedriverService.updateTags(id, data);
    }
  
    @ApiBody({ type: [ValueDriverInput] })
    @Post('/bulk')
    async saveMany(@Body() data: ValueDriverInput[]) {
      return this.valuedriverService.saveMany(data);
    }
  
    @Get('')
    async findAll(@Query() args: ValueDriversArgs) {
      return this.valuedriverService.findAll(args);
    }
  
  
    @Get('/count')
    async count(@Query() args: ValueDriversArgs) {
      return this.valuedriverService.count(args);
    }
  
    @Get('/:id')
    async findOne(@Param('id', new ParseIntPipe()) id: number) {
      return this.valuedriverService.findOneById(id);
    }
  
    @Post('')
    async create(@Body() data: ValueDriverCreationInput) {
      return this.valuedriverService.create(data);
    }
  
    @Post('/:id')
    async save(@Param('id', new ParseIntPipe()) id: number, @Body() data: ValueDriverInput) {
      return this.valuedriverService.save(id, data);
    }
  
    @Delete('/:id')
    async remove(@Param('id', new ParseIntPipe()) id: number) {
      return this.valuedriverService.remove(id);
    }
  }
  