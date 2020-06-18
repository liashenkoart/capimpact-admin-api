import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class CapabilityTreeCreationInput {

  @ApiPropertyOptional({ type: Number})
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  readonly parent_id?: number;

  @ApiProperty({ type: Number})
  @Field(() => ID)
  @IsNotEmpty()
  @Type(() => Number)
  readonly capability_lib_id: number;

  @ApiPropertyOptional({ type: Number})
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  readonly industry_tree_id?: number;
}
