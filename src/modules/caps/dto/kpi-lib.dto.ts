import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { BenefitType } from '../entities';

@InputType()
export class KpiLibInput {
  @Field(() => ID)
  @IsOptional()
  @IsNumber()
  readonly id?: number;

  @Field({ nullable: true })
  @IsOptional()
  readonly label?: string;

  @Field({ nullable: true })
  @IsOptional()
  min?: number;

  @Field({ nullable: true })
  @IsOptional()
  max?: number;

  @Field({ nullable: true })
  @IsOptional()
  readonly description?: string;

  @Field({ nullable: true })
  @IsOptional()
  readonly kpi?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  readonly tags?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  readonly types?: string[];

  @Field({ nullable: true })
  @IsOptional()
  readonly source?: string;

  @Field({ nullable: true })
  @IsOptional()
  readonly benefitType?: BenefitType;

  @Field({ nullable: true })
  @IsOptional()
  readonly is_active?: boolean;
}
