import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

@InputType()
export class IndustryInput {
  @Field(() => ID)
  @IsOptional()
  @IsNumber()
  readonly id?: number;

  @Field()
  @IsNotEmpty()
  name: string;
}
