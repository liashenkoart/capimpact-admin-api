import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class SaveCapTreeTechsDto {
  @ApiProperty()
  @Field(() => [ID])
  technologies: number[];
}
