import { InputType, Field, ID } from 'type-graphql';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class CapabilityTreeInput {
  @ApiProperty({ type: Number })
  @Field(() => ID)
  @IsOptional()
  @Type(() => Number)
  id?: number;

  @ApiPropertyOptional({ type: Number })
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  parentId?: number;


  orders?: [];


  @ApiProperty({ type: Number })
  @Field(() => ID)
  @IsOptional()
  @Type(() => Number)
  readonly capability_lib_id?: number;

  @IsOptional()
  @Type(() => String)
  readonly status?: string;

  @ApiPropertyOptional({ type: Number })
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  readonly industry_tree_id?: number;

  @ApiPropertyOptional({ type: String })
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => String)
  readonly cap_name?: string;
}
