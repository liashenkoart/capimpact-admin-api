import {
    Controller,
    Get,
    Post,
    Body,
    Delete,
    Put,
    UseInterceptors,
    ClassSerializerInterceptor,
    Param,
    Query,
  } from '@nestjs/common';
import { ValueDriverLibService } from './value_driver_lib.service';
import { ValueDriverLibResponseDto,
         UpdateValueDriverLibDto, 
         CreateValueDriverLibDto,
         UpdateValueDriverLibResponseDto,
         CreateValueDriverLibResponseDto,
         CapabilityLibNameAvailableArgs} from './index.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('valuedriverlibs')
  export class ValueDriverLibController {
    constructor(private readonly valueDriverlIBSService: ValueDriverLibService) {}

    @Get()
    list(@Query() query: CapabilityLibNameAvailableArgs): Promise<ValueDriverLibResponseDto[]> {
        return this.valueDriverlIBSService.list(query);
    }

    @Get('/:id')
    item(@Param('id') id: number): Promise<ValueDriverLibResponseDto> {
        return this.valueDriverlIBSService.findOne(id);
    }

    @Delete('/:id')
    delete(@Param('id') id: number): Promise<any> {
        return this.valueDriverlIBSService.delete(id);
    }

    @Post()
    create(@Body() body: UpdateValueDriverLibDto): Promise<CreateValueDriverLibResponseDto> {
        return this.valueDriverlIBSService.create(body);
    }

    @Put('/:id')
    put(@Body() body: CreateValueDriverLibDto,@Param('id') id: number): Promise<UpdateValueDriverLibResponseDto> {
        return this.valueDriverlIBSService.update(id,body);
    }
  }
  