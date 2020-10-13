import { InputType } from 'type-graphql';
import {  IsNumber, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class CapabilityTreeLocationDto {
  @ApiProperty()
  @IsNumber()
  readonly cap_id: number;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  readonly address: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  readonly city: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  readonly country: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  readonly state: string;

  @ApiProperty()
  @IsNumber()
  readonly zipcode: number;
}
