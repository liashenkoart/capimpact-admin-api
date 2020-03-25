import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class GroupFilterCreationInput {
  @Field()
  @IsNotEmpty()
  readonly name: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly companyId: number;

  @Field(() => ID)
  @IsOptional()
  @Type(() => Number)
  readonly parentId?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  readonly filters?: string[];
}
