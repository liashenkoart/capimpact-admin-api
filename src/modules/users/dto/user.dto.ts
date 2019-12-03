import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserInput {
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly firstName: string;

  @IsNotEmpty()
  readonly lastName: string;
}
