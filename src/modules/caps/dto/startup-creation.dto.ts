import { InputType, Field } from 'type-graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class StartupCreationInput {
  @Field()
  @IsNotEmpty()
  name: string;
}
