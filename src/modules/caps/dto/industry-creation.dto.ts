import { InputType, Field } from 'type-graphql';
import { IsNotEmpty } from 'class-validator';
import { Generated } from 'typeorm';

@InputType()
export class IndustryCreationInput {
  @Field({ nullable: true })
  @Generated('increment')
  id?: number;

  @Field()
  @IsNotEmpty()
  name: string;
}
