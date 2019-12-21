import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CapabilityInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly id: number;

  @Field({ nullable: true })
  @IsOptional()
  readonly name?: string;

  @Field({ nullable: true })
  @IsOptional()
  readonly hierarchy_id?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly industry_id?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly parentId?: number;
}
