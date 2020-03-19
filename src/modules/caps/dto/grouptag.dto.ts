import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class GroupTagInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly id: number;

  @Field({ nullable: true })
  @IsOptional()
  readonly name?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  readonly tags?: string[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly companyId?: number;
}
