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
  import { ApiTags, ApiBearerAuth, ApiCreatedResponse, ApiBody } from '@nestjs/swagger';
  import { GroupTagService } from './grouptag.service';
  import { GroupTagInput, GroupTagCreationInput, GroupTagsArgs } from './dto';
  
  @ApiBearerAuth()
  @ApiTags('grouptags')
  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller('grouptags')
  export class GroupTagController {
    constructor(private readonly grouptagService: GroupTagService) {}
  
    @Get('')
    async findAll(@Query() args?: GroupTagsArgs) {
      return this.grouptagService.findAll({ ...args });
    }
  
    @Get('/paginate')
    async findAllPagination(@Query() args?: GroupTagsArgs) {
      return this.grouptagService.findAllPagination({ ...args });
    }
  
    @Get('/:id')
    async findOne(@Param('id', new ParseIntPipe()) id: number) {
      return this.grouptagService.findOneById(id);
    }
  
    @Post('')
    async create(@Body() data: GroupTagCreationInput) {
      return this.grouptagService.create({ ...data });
    }
  
    @Post('/:id')
    async save(@Param('id', new ParseIntPipe()) id: number, @Body() data: GroupTagInput) {
      return this.grouptagService.save({ ...data, id });
    }
  
    @ApiBody({ type: [GroupTagInput] })
    @Post('/save-many')
    async saveMany(@Body() data: GroupTagInput[]) {
      return this.grouptagService.saveMany(data);
    }
  
    @Delete('/:id')
    async remove(@Param('id', new ParseIntPipe()) id: number) {
      return this.grouptagService.remove(id);
    }
  }
  