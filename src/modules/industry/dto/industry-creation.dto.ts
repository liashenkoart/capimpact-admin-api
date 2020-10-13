import { InputType, Field } from 'type-graphql';
import { IsNotEmpty } from 'class-validator';
import { Generated } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class IndustryCreationInput {
  @ApiProperty()
  @Field({ nullable: true })
  @Generated('increment')
  id?: number;

  @ApiProperty()
  @Field()
  @IsNotEmpty()
  name: string;
}
