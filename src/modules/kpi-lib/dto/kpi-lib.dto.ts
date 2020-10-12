import { InputType, Field, ID } from 'type-graphql';
import { IsOptional, IsNumber } from 'class-validator';
import { BenefitType } from "../kpi-lib.enums";
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

@InputType()
export class KpiLibInput {
  @ApiProperty()
  @Field(() => ID)
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly label?: string;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  min?: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  max?: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly description?: string;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly kpi?: string;

  @ApiProperty()
  @Field(() => [Number], { nullable: true })
  @IsOptional()
  tags?: number[];

  @ApiProperty()
  @Field(() => [String], { nullable: true })
  @IsOptional()
  readonly types?: string[];

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly source?: string;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly benefitType?: BenefitType;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly is_active?: boolean;

  @ApiProperty()
  @Field(() => [ID], { nullable: true })
  @IsOptional()
  capability_libs?: any[];

  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  process_id?: number;
}
