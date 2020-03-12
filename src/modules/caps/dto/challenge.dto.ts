import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class ChallengeInput {
  @Field(() => ID)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly id?: number;

  @Field({ nullable: true })
  @IsOptional()
  readonly name?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly companyId?: number;

  @IsOptional()
  readonly issues?: any[];
}
