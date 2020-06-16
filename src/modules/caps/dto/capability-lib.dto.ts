import { InputType, Field, ID } from 'type-graphql';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class CapabilityLibInput {
  @ApiProperty()
  @Field(() => ID)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly id?: number;

  @ApiProperty()
  @Field()
  @IsOptional()
  readonly name?: string;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly description?: string;
}
