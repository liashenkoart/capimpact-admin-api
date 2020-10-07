import { ArgsType, Field, ID } from 'type-graphql';
import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { BaseArgs } from '@modules/common/dto/base.args';

@ArgsType()
export class CapabilityLibsArgs extends BaseArgs {
  @ApiPropertyOptional({ type: Number, isArray: true })
  @Field(() => [ID], { nullable: true })
  @IsOptional()
  kpi_libs?: number[];

  @ApiPropertyOptional({ type: String})
  @Field(() => [ID], { nullable: true })
  @IsOptional()
  status?: 'active' | 'inactive';

}
