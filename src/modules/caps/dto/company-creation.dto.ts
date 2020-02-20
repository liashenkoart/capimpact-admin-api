import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CompanyCreationInput {
  @Field()
  @IsNotEmpty()
  readonly name: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly industry_id: number;

  @Field({ nullable: true })
  @IsOptional()
  cid?: string;
}
