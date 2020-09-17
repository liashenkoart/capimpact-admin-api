import { InputType } from 'type-graphql';
import {  IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class CapabilityTreeLocationDto {
  @ApiProperty()
  @IsNumber()
  readonly cap_id: number;

  @ApiProperty()
  @IsString()
  readonly address: string;

  @ApiProperty()
  @IsString()
  readonly city: string;

  @ApiProperty()
  @IsString()
  readonly country: string;

  @ApiProperty()
  @IsString()
  readonly state: string;

  @ApiProperty()
  @IsNumber()
  readonly zipcode: number;
}
