import { InputType, Field, ID } from 'type-graphql';
import { IsOptional, IsNumber } from 'class-validator';
import { Generated } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class KpiBenchmarkCreationInput {
  @ApiProperty()
  @Field({ nullable: true })
  @Generated('increment')
  id?: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly benchmark?: number;

  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  readonly kpilibId?: number;

  
  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  readonly industryId?: number;
}
