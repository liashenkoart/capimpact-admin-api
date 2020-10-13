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
  import { ChallengeService } from './challenge.service';
  import { ChallengeInput, ChallengeCreationInput, ChallengesArgs } from './dto';
  import { CHALLANGE_API_TAG } from './challange.constants';

  @ApiBearerAuth()
  @ApiTags(CHALLANGE_API_TAG)
  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller(CHALLANGE_API_TAG)
  export class ChallengeController {
    constructor(private readonly challengeService: ChallengeService) {}
  
    @Get('')
    async findAll(@Query() args?: ChallengesArgs) {
      return this.challengeService.findAll({ ...args });
    }
  
    @Get('/paginate')
    async findAllPagination(@Query() args?: ChallengesArgs) {
      return this.challengeService.findAllPagination({ ...args });
    }
  
    @Get('/:id')
    async findOne(@Param('id', new ParseIntPipe()) id: number) {
      return this.challengeService.findOneById(id);
    }
  
    @Post('')
    async create(@Body() data: ChallengeCreationInput) {
      return this.challengeService.create({ ...data });
    }
  
    @Post('/:id')
    async save(@Param('id', new ParseIntPipe()) id: number, @Body() data: ChallengeInput) {
      return this.challengeService.save({ ...data, id });
    }
  
    @ApiBody({ type: [ChallengeInput] })
    @Post('/save-many')
    async saveMany(@Body() data: ChallengeInput[]) {
      return this.challengeService.saveMany(data);
    }
  
    @Delete('/:id')
    async remove(@Param('id', new ParseIntPipe()) id: number) {
      return this.challengeService.remove(id);
    }
  }
  