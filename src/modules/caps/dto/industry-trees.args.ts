import { ArgsType, Field, ID } from 'type-graphql';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { BaseArgs } from '@modules/common/dto/base.args';

@ArgsType()
export class IndustryTreesArgs extends BaseArgs {

  @ApiPropertyOptional({ type: Number})
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  readonly parentId?: number;

  @ApiPropertyOptional({ type: Number, isArray: true })
  @Field(() => [ID], { nullable: true })
  @IsOptional()
  companies?: number[];
}
