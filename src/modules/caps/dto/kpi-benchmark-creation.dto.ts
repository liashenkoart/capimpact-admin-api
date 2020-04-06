import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Generated } from 'typeorm';

@InputType()
export class KpiBenchmarkCreationInput {
  @Field({ nullable: true })
  @Generated('increment')
  id?: number;

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
