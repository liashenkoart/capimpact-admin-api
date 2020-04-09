import { InputType, Field } from 'type-graphql';
import { IsEmail, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class UserCreationInput {
  @ApiProperty()
  @Field()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @Field()
  @Length(8)
  readonly password: string;
}
