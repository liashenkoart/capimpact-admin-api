import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class ChallengeCreationInput {
  @ApiProperty()
  @Field()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty()
  @Field(() => ID)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly companyId: number;

  @ApiProperty()
  @IsOptional()
  readonly issues?: any[];
}
