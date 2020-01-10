import { ArgsType, Field, ID } from 'type-graphql';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { BaseArgs } from '@modules/common/dto/base.args';

@ArgsType()
export class CompaniesArgs extends BaseArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  industry_id?: number;
}
