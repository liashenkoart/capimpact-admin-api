import { InputType, Field } from 'type-graphql';
import { IsEmail, Length } from 'class-validator';

@InputType()
export class UserCreationInput {
  @Field()
  @IsEmail()
  readonly email: string;

  @Field()
  @Length(8)
  readonly password: string;
}
