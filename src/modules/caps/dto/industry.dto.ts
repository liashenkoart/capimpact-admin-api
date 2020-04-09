import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class IndustryInput {
  @ApiProperty()
  @Field(() => ID)
  @IsOptional()
  @IsNumber()
  readonly id?: number;

  @ApiProperty()
  @Field()
  @IsNotEmpty()
  name: string;
}
