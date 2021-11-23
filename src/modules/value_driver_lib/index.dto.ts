import { InputType, Field, ID } from 'type-graphql';
import { IsNumber, IsOptional, IsString, IsArray, IsBoolean, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValueDriverLib } from './value_driver_lib.entity';
import { Type } from 'class-transformer';

@InputType()
export class ValueDriveLib {
  @ApiProperty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsString()
  readonly description: string;

  @ApiProperty()
  @IsBoolean()
  readonly status: boolean;

  @ApiProperty()
  @IsArray({ each: true})
  readonly tags: string;
}

@InputType()
export class ValueDriverLibResponseDto extends ValueDriverLib {
    @ApiProperty()
    @IsString()
    readonly id: number;
}

@InputType()
export class UpdateValueDriverLibDto extends ValueDriverLib {}

@InputType()
export class CreateValueDriverLibDto extends ValueDriverLib {}
@InputType()
export class UpdateValueDriverLibResponseDto extends ValueDriverLibResponseDto {}

@InputType()
export class CreateValueDriverLibResponseDto extends ValueDriverLibResponseDto {}


export class CapabilityLibNameAvailableArgs {
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  page: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  limit: number;

  @IsString()
  @IsOptional()
  search: string;
  
  @IsOptional()
  order: any;
}

