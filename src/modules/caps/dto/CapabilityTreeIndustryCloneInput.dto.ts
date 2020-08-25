import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class CapabilityTreeIndustryCloneInput {


  @ApiProperty({ type: Number})
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  readonly id: number;

  @ApiProperty({ type: Number})
  @Field(() => ID, { nullable: true })
  @Type(() => Number)
  readonly parentId: number;

}
