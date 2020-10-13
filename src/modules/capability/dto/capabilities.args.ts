import { ArgsType, Field, ID } from 'type-graphql';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { BaseArgs } from '../../common/dto/base.args';

@ArgsType()
export class CapabilitiesArgs extends BaseArgs {

  @ApiPropertyOptional()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  industry_id?: number;

  @ApiPropertyOptional()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  company_id?: number;

  @ApiPropertyOptional()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  parentId?: number;

  @ApiPropertyOptional({
    type: Number,
    isArray: true
  })
  @Field(() => [ID], { nullable: true })
  @IsOptional()
  ids?: number[];
}
