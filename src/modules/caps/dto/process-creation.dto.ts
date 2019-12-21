import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

@InputType()
export class ProcessCreationInput {
  @Field()
  @IsNotEmpty()
  readonly name: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsNumber()
  readonly industry_id: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  readonly parentId?: number;

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
}
