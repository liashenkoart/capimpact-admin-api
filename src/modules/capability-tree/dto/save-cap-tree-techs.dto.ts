import { InputType, Field, ID, } from 'type-graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumberString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class SaveCapTreeTechsDto {
  @ApiProperty()
  @Field(() => [ID])
  technologies: number[];
}


@InputType()
export class GetTopChildrenQuery {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  company_id?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumberString()
  @Type(() => Number)
  parentId?: number;
}