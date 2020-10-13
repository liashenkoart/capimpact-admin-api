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
    Req,
    ParseIntPipe,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
  
  import { IndustryService } from './service/industry.service';
  import { IndustryInput, IndustryCreationInput, IndustriesArgs } from './dto';
  import { INDUSTRY_API_TAG } from './industry.constants'

  @ApiBearerAuth()
  @ApiTags(INDUSTRY_API_TAG)
  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller(INDUSTRY_API_TAG)
  export class IndustryController {
    constructor(
      private readonly industryService: IndustryService //@Inject(CACHE_MANAGER) private cacheManager
    ) {}
  
    @Get('')
    async findAll(@Param() args: IndustriesArgs) {
      return this.industryService.findAll(args);
    }
  
    @Get('/:id')
    async findOne(@Param('id', new ParseIntPipe()) id: number) {
      return this.industryService.findOneById(id);
    }
  
    @Post('')
    async create(@Body() data: IndustryCreationInput, @Req() req: any) {
      return this.industryService.create(data, { user: req.user });
    }
  
    @Post('/:id')
    async save(@Param('id', new ParseIntPipe()) id: number, @Body() data: IndustryInput) {
      return this.industryService.save(id, data);
    }
  
    @Post('/:id/clone')
    async clone(
      @Param('id', new ParseIntPipe()) id: number,
      @Body() data: IndustryCreationInput,
      @Req() req: any
    ) {
      return this.industryService.clone(id, data, { user: req.user });
    }
  
    @Delete('/:id')
    async remove(@Param('id', new ParseIntPipe()) id: number) {
      return this.industryService.remove(+id);
    }
  }
  