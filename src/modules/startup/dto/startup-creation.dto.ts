import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class StartupCreationInput {
  @ApiProperty()
  @Field()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly description?: string;

  @ApiProperty()
  @Field(() => [ID])
  @IsOptional()
  tags: any[];
}
