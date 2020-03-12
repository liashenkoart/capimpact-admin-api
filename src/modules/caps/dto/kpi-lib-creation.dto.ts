import { InputType, Field } from 'type-graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { BenefitType } from '../entities';

@InputType()
export class KpiLibCreationInput {
  @Field({ nullable: true })
  @IsOptional()
  readonly label: string;

  @Field({ nullable: true })
  @IsOptional()
  readonly description?: string;

  @Field({ nullable: true })
  @IsOptional()
  readonly kpi?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  readonly tags?: string[];

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
