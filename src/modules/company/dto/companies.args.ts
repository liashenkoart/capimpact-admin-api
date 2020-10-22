import { ArgsType, Field, ID } from 'type-graphql';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { BaseArgs } from '@modules/common/dto/base.args';
import { ApiPropertyOptional } from '@nestjs/swagger';

@ArgsType()
export class CompaniesArgs extends BaseArgs {
  @ApiPropertyOptional()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  industry_id?: number;

  @ApiPropertyOptional({ type: Number, isArray: true })
  @Field(() => [ID], { nullable: true })
  @IsOptional()
  industry_trees?: number[];

  @ApiPropertyOptional({ type: String})
  @Field(() => [ID], { nullable: true })
  @IsOptional()
  search?: string;
}
