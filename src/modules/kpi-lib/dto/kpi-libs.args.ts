import { ArgsType, Field, ID } from 'type-graphql';
import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { BaseArgs } from '@modules/common/dto/base.args';

@ArgsType()
export class KpiLibsArgs extends BaseArgs {
  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  process_id?: number;
}
