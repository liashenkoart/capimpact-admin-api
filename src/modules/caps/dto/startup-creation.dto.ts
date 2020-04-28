import { InputType, Field } from 'type-graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class StartupCreationInput {
  @ApiProperty()
  @Field()
  @IsNotEmpty()
  name: string;
}
