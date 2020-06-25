import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class IndustryTreeCreationInput {

  @ApiProperty()
  @Field()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly description?: string;

  @ApiPropertyOptional({ type: Number })
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  readonly parent_id?: number;
}
