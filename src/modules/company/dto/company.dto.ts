import { InputType, Field, ID } from 'type-graphql';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class CompanyInput {
  @ApiProperty()
  @Field(() => ID)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly id?: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly name?: string;

  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly industry_id?: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly cid?: string;

  @ApiProperty()
  @IsOptional()
  readonly capabilities?: any[];

  @ApiProperty()
  @Field(() => [ID])
  @IsOptional()
  industry_trees?: any[];
}
