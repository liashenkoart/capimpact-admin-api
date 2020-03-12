import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class ChallengeCreationInput {
  @Field()
  @IsNotEmpty()
  readonly name: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly companyId: number;

  @IsOptional()
  readonly issues?: any[];
}
