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
  import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
  
  import { GroupFilterService } from './groupfilter.service';
  import { GroupFilterInput, GroupFilterCreationInput, GroupFiltersArgs } from './dto';
  import { GROUP_FILTER_API_TAG } from './groupfilter.constants';

  @ApiBearerAuth()
  @ApiTags(GROUP_FILTER_API_TAG)
  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller(GROUP_FILTER_API_TAG)
  export class GroupFilterController {
    constructor(private readonly groupFilterService: GroupFilterService) {}
  
    @Get('')
    async findAll(@Query() args?: GroupFiltersArgs) {
      return this.groupFilterService.findAll({ ...args });
    }
  
    @Get('/paginate')
    async findAllPagination(@Query() args?: GroupFiltersArgs) {
      return this.groupFilterService.findAllPagination({ ...args });
    }
  
    @Get('/:id')
    async findOne(@Param('id', new ParseIntPipe()) id: number) {
      return this.groupFilterService.findOneById(id);
    }
  
    @Post('')
    async create(@Body() data: GroupFilterCreationInput) {
      return this.groupFilterService.create({ ...data });
    }
  
    @Post('/:id')
    async save(@Param('id', new ParseIntPipe()) id: number, @Body() data: GroupFilterInput) {
      return this.groupFilterService.save({ ...data, id });
    }
  
    @ApiBody({ type: [GroupFilterInput] })
    @Post('/save-many')
    async saveMany(@Body() data: GroupFilterInput[]) {
      return this.groupFilterService.saveMany(data);
    }
  
    @Delete('/:id')
    async remove(@Param('id', new ParseIntPipe()) id: number) {
      return this.groupFilterService.remove(id);
    }
  }
  