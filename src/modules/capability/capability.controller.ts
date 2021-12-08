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
    ParseArrayPipe
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import _ from 'lodash';
  import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
  
  import { CapabilityService } from './services/capability.service';
  import { CapabilitiesArgs, CapabilityInput, CapabilityCreationInput, CapabilityFilterUpdate } from './dto';
  import { CAPABILITY_API_TAG } from './capability.constants';

  @ApiBearerAuth()
  @ApiTags(CAPABILITY_API_TAG)
  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller(CAPABILITY_API_TAG)
  export class CapabilityController {
    constructor(private readonly capabilityService: CapabilityService) {}
  
    @Get('')
    async findAll(@Query() query: CapabilitiesArgs) {
      return this.capabilityService.findAll(this.parseArgs(query));
    }

    @Get('/by-ids')
    findByIds(
      @Query('ids',new ParseArrayPipe({ items: Number, separator: ',' }))
      ids: number[],
    ) {
      return this.capabilityService.getCapabilitiesByIds(ids)
    }

    @Get('list')
    async list() {
      return this.capabilityService.list();
    }
    
    @Get('tree')
    async tree(@Query() query: CapabilitiesArgs) {
      return this.capabilityService.tree(query);
    }
  
    @Get('treeByIndustryTree')
    async treeByIndustryTree(@Query() query: CapabilitiesArgs) {
      return this.capabilityService.treeByIndustryTree(query);
    }
  
    @Get('/:id')
    async findOne(@Param('id', new ParseIntPipe()) id: number) {
      return this.capabilityService.findOneById(id);
    }
  
    @Post('')
    async create(@Body() data: CapabilityCreationInput, @Req() req: any) {
      return this.capabilityService.create(data, { user: req.user });
    }

    @Post('bulk')
    async bulk(@Body() data, @Req() req: any) {
      return this.capabilityService.saveBulk(data, { user: req.user });
    }
  
    @ApiBody({ type: [CapabilityInput] })
    @Post('/tags/bulk')
    async saveManyTags(@Body() data: CapabilityInput[], @Req() req: any) {
      return this.capabilityService.saveManyTags(data, { user: req.user });
    }

    @ApiBody({ type: [CapabilityInput] })
    @Post('/spend-fte/bulk')
    async saveManySpendFTe(@Body() data: CapabilityInput[], @Req() req: any) {
      return this.capabilityService.saveManySpendFTe(data, { user: req.user });
    }

    @ApiBody({ type: [CapabilityFilterUpdate] })
    @Post('/filters/bulk')
    async saveManyFIlters(@Body() data:  CapabilityFilterUpdate[], @Req() req: any) {
      return this.capabilityService.saveManyFilters(data, { user: req.user });
    }
  
    @Post('/:id')
    async save(
      @Param('id', new ParseIntPipe()) id: number,
      @Body() data: CapabilityInput,
      @Req() req: any
    ) {
      return this.capabilityService.save(id, data, { user: req.user });
    }
  
    @Delete('/:id')
    async remove(@Param('id', new ParseIntPipe()) id: number) {
      return this.capabilityService.remove(id);
    }
  
    private parseArgs(args: CapabilitiesArgs): CapabilitiesArgs {
      if (args.ids && !_.isArray(args.ids)) {
        args.ids = Object.values(args.ids).map(id => Number(id));
        args.limit = 0;
      }
      delete args['sort'];
      return args; 
    }
  }
  