import { InputType, Field, ID } from 'type-graphql';
import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CapabilityTreeOrderDto } from "./capability-tree-order.dto";

@InputType()
export class CapabilityTreeIndustryCreationInput {

  @ApiPropertyOptional({ type: Number})
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  readonly id: number;

  @ApiProperty({ type: Number})
  @Field(() => ID, { nullable: true })
  @Type(() => Number)
  readonly parentId: number;

  @ApiProperty({ type: Number})
  @Field(() => ID, { nullable: true })
  @Type(() => Number)
  readonly company_id?: number;

  @ApiPropertyOptional({ type: Number})
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  readonly industry_tree_id?: number;

  @ApiProperty({ type: Array })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CapabilityTreeOrderDto)
  orders?: CapabilityTreeOrderDto[];

  @ApiPropertyOptional({ type: Number})
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => String)
  type?: string;

  @ApiPropertyOptional({ type: Number})
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  capability_lib_id?: number = null;

  @ApiPropertyOptional({ type: String})
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => String)
  readonly cap_name?: string;
}
