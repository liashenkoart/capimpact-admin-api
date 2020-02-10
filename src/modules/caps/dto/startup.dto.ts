import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

@InputType()
export class StartupInput {
  @Field(() => ID)
  @IsOptional()
  @IsNumber()
  readonly cid?: string;

  @Field()
  @IsNotEmpty()
  name: string;
}
