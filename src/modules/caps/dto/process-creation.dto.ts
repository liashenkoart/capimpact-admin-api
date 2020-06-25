import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import {Type} from "class-transformer";

@InputType()
export class ProcessCreationInput {
  @ApiProperty()
  @Field()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty()
  @Field(() => ID)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly industry_id: number;

  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  readonly parentId?: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly pcf_id?: string;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly hierarchy_id?: string;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly difference_idx?: string;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly change_details?: string;

  @ApiProperty()
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  readonly metrics_avail?: boolean;

  @ApiProperty()
  @Field(() => [ID], { nullable: true })
  @IsOptional()
  kpi_libs?: any[];
}
