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
    Req,
    ParseIntPipe,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { ApiTags, ApiBearerAuth, ApiCreatedResponse, ApiBody } from '@nestjs/swagger';
  
  import { ProcessService } from './services';
  import { ProcessesArgs, ProcessInput, ProcessCreationInput } from './dto';
  import { PROCESS_API_TAG } from './process.constants';

  @ApiBearerAuth()
  @ApiTags(PROCESS_API_TAG)
  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller(PROCESS_API_TAG)
  export class ProcessController {
    constructor(private readonly processService: ProcessService) {}
  
    @Get('')
    async findAll(@Query() query: ProcessesArgs) {
      return this.processService.findAll(query);
    }
  
    @Get('tree')
    async tree(@Query() query: ProcessesArgs) {
      return this.processService.tree(query);
    }
  
    @Get('tags/:id')
    async tags(@Param('id') id: string) {
      return this.processService.getTags(id);
    }
  
    @Post('tags/:id')
    async saveTags(@Param('id') id: string, @Body() data) {
      return this.processService.updateTags(id, data);
    }
  
    @Get('default-tree')
    async defaultTree(@Query() query: ProcessesArgs) {
      return this.processService.defaultTree(query);
    }
  
    @Get('/:id')
    async findOne(@Param('id', new ParseIntPipe()) id: number) {
      return this.processService.findOneById(id);
    }
  
    @Post('')
    async create(@Body() data: ProcessCreationInput, @Req() req: any) {
      return this.processService.create(data, { user: req.user });
    }
  
    @ApiBody({ type: [ProcessInput] })
    @Post('/bulk')
    async saveMany(@Body() data: ProcessInput[], @Req() req: any) {
      return this.processService.saveMany(data, { user: req.user });
    }
  
    @Post('/:id')
    async save(
      @Param('id', new ParseIntPipe()) id: number,
      @Body() data: ProcessInput,
      @Req() req: any
    ) {
      return this.processService.save(id, data, { user: req.user });
    }
  
    @Delete('/:id')
    async remove(@Param('id', new ParseIntPipe()) id: number) {
      return this.processService.remove(id);
    }
  }
  