import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class CapabilityFilterUpdate {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  readonly id: number;

  @ApiProperty()
  @IsOptional()
  readonly name?: string;

  @ApiProperty()
  @IsOptional()
  readonly filters?: any;

}
