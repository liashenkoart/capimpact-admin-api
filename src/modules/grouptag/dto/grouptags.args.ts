import { ArgsType, Field, ID } from 'type-graphql';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { BaseArgs } from '@modules/common/dto/base.args';
import { ApiPropertyOptional } from '@nestjs/swagger';

@ArgsType()
export class GroupTagsArgs extends BaseArgs {
  @ApiPropertyOptional()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  companyId?: number;
}
