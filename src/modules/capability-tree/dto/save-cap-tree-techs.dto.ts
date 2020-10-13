import { InputType, Field, ID } from 'type-graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class SaveCapTreeTechsDto {
  @ApiProperty()
  @Field(() => [ID])
  technologies: number[];
}
