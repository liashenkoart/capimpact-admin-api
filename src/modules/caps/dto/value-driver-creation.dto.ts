import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

import { ValueDriver } from '../entities';

@InputType()
export class ValueDriverCreationInput {
  @Field()
  @IsNotEmpty()
  public name: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  public industryId?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  public companyId?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  public parentId?: number;

  @IsOptional()
  public parent?: ValueDriver;
}
