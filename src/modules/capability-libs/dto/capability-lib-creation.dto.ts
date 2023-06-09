import {InputType, Field, ID} from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class CapabilityLibCreationInput {
  @ApiProperty()
  @Field()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly description?: string;

  @ApiProperty()
  @Field(() => [ID])
  @IsOptional()
  kpi_libs?: any[];

  @ApiProperty()
  @Field(() => [ID])
  @IsOptional()
  tags: any[]; 
  
  @ApiProperty()
  @Field(() => [ID])
  // @IsNumber()
  @IsOptional()
  industryId?: number;
}


