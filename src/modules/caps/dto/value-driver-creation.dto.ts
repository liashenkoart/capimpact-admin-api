import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { ValueDriver } from '../entities';

@InputType()
export class ValueDriverCreationInput {
  @ApiProperty()
  @Field()
  @IsNotEmpty()
  public name: string;

  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  public industryId?: number;

  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  public companyId?: number;

  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  public parentId?: number;

  @ApiProperty()
  @IsOptional()
  public parent?: ValueDriver;

  @ApiProperty()
  @IsOptional()
  readonly kpis?: any;
}
