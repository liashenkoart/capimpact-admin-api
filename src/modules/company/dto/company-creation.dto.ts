import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class CompanyCreationInput {
  @ApiProperty()
  @Field()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty()
  @Field(() => ID)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly industry_id: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  cid?: string;
}
