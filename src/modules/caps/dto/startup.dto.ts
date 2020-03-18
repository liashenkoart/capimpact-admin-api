import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class StartupInput {
  @Field(() => ID)
  @IsOptional()
  readonly cid?: string;

  @Field()
  @IsOptional()
  name?: string;

  @IsOptional()
  capabilities?: any;
}
