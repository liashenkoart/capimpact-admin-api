import { ArgsType, Field, ID } from 'type-graphql';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { BaseArgs } from '@modules/common/dto/base.args';

@ArgsType()
export class ValueDriversArgs extends BaseArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  industryId?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  companyId?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  parentId?: number;
}
