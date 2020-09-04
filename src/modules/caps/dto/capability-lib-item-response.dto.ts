import {InputType, Field, ID} from 'type-graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '../entities';
@InputType()
export class CapabilityLibItemResponse {
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
  tags: Tag[];
}
