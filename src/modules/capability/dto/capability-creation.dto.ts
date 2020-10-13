import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class CapabilityCreationInput {
  @ApiProperty()
  @Field()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly industry_id?: number;

  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly company_id?: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly capitalCosts?: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly fte?: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly salaryCosts?: number;

  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly parentId?: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly hierarchy_id?: string;
}
