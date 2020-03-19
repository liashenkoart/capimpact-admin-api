import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class GroupTagCreationInput {
  @Field()
  @IsNotEmpty()
  readonly name: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly companyId: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  readonly tags?: string[];
}
