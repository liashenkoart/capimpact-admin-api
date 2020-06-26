import { InputType, Field, ID } from 'type-graphql';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class IndustryTreeInput {
  @ApiProperty({ type: Number })
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

  @ApiPropertyOptional({ type: Number })
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  readonly parentId?: number;

  @ApiProperty()
  @Field(() => [String], { nullable: true })
  @IsOptional()
  readonly examples?: string[];

  @ApiPropertyOptional()
  @Field({ nullable: true })
  @IsOptional()
  readonly code?: string;

  @ApiProperty()
  @Field(() => [ID])
  @IsOptional()
  companies?: any[];
}
