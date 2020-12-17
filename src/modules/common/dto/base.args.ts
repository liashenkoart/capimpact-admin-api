import { ArgsType, Field, Int } from 'type-graphql';
import { Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

@ArgsType()
export class BaseArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  page?: number = 1;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  skip?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0)
  @Max(1000)
  @Type(() => Number)
  limit?: number = 25;
}
