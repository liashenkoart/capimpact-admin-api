import { InputType, Field } from 'type-graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class UserInput {
  @ApiProperty()
  @Field()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @Field()
  @IsNotEmpty()
  readonly firstName: string;

  @ApiProperty()
  @Field()
  @IsNotEmpty()
  readonly lastName: string;
}
