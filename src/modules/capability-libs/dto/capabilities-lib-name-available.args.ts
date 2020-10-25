import { ArgsType, Field, ID } from 'type-graphql';
import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { BaseArgs } from '@modules/common/dto/base.args';

@ArgsType()
export class CapabilityLibNameAvailableArgs extends BaseArgs {
  @ApiPropertyOptional({ type: Number })
  @Field(() => [ID], { nullable: true })
  @IsOptional()
  id?: number;

  @ApiPropertyOptional({ type: String})
  name: string;
}
