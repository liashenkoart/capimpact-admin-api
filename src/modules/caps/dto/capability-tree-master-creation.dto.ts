import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class CapabilityTreeMasterCreationInput {

  @ApiPropertyOptional({ type: Number})
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  parentId?: number;

  @ApiProperty({ type: Number})
  @Field(() => ID)
  @Type(() => Number)
  readonly capability_lib_id: number;

  @IsOptional()
  @Type(() => String)
  readonly type?: string;
}
