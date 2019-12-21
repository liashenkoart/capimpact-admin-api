import { InputType, Field, ID } from 'type-graphql';
import { IsOptional, IsNumber } from 'class-validator';

@InputType()
export class ProcessInput {
  @Field(() => ID)
  @IsOptional()
  @IsNumber()
  readonly id?: number;

  @Field({ nullable: true })
  @IsOptional()
  readonly name?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  readonly industry_id?: number;

  @Field({ nullable: true })
  @IsOptional()
  readonly pcf_id?: string;

  @Field({ nullable: true })
  @IsOptional()
  readonly hierarchy_id?: string;

  @Field({ nullable: true })
  @IsOptional()
  readonly difference_idx?: string;

  @Field({ nullable: true })
  @IsOptional()
  readonly change_details?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  readonly metrics_avail?: boolean;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  readonly parentId?: number;
}
