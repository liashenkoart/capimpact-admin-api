import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class ValueDriverInput {
  @ApiProperty()
  @Field(() => ID)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly id: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly name?: string;

  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly industryId?: number;

  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly companyId?: number;

  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly parentId?: number;

  @ApiProperty()
  @IsOptional()
  readonly kpis?: any;
}
