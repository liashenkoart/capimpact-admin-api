import { InputType, Field } from 'type-graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class IndustryInput {
  @Field()
  @IsNotEmpty()
  name: string;
}
