import { InputType, Field } from 'type-graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class UserInput {
  @Field()
  @IsEmail()
  readonly email: string;

  @Field()
  @IsNotEmpty()
  readonly firstName: string;

  @Field()
  @IsNotEmpty()
  readonly lastName: string;
}
