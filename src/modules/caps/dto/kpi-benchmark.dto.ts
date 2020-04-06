import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

@InputType()
export class KpiBenchmarkInput {
  @Field(() => ID)
  @IsOptional()
  @IsNumber()
  readonly id?: number;

  @Field()
  @IsOptional()
  readonly benchmark?: number;
  
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  readonly kpilibId?: number;
  
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  readonly industryId?: number;
}
