import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class GroupFilterCreationInput {
  @ApiProperty()
  @Field()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty()
  @Field(() => ID)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly companyId: number;

  @ApiProperty()
  @Field(() => ID)
  @IsOptional()
  @Type(() => Number)
  readonly parentId?: number;

  @ApiProperty()
  @Field(() => [String], { nullable: true })
  @IsOptional()
  readonly filters?: string[];
}
