import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CapabilityCreationInput {
  @Field()
  @IsNotEmpty()
  readonly name: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly industry_id?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly company_id?: number;

  @Field({ nullable: true })
  @IsOptional()
  readonly capitalCosts?: number;

  @Field({ nullable: true })
  @IsOptional()
  readonly fte?: number;

  @Field({ nullable: true })
  @IsOptional()
  readonly salaryCosts?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly parentId?: number;

  @Field({ nullable: true })
  @IsOptional()
  readonly hierarchy_id?: string;
}
