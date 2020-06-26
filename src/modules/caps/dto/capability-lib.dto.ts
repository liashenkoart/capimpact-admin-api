import { InputType, Field, ID } from 'type-graphql';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class CapabilityLibInput {
  @ApiProperty()
  @Field(() => ID)
  @IsOptional()
  @Type(() => Number)
  id?: number;

  @ApiProperty()
  @Field()
  @IsOptional()
  readonly name?: string;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly description?: string;

  @ApiProperty()
  @Field(() => [ID])
  @IsOptional()
  kpi_libs?: any[];
}
