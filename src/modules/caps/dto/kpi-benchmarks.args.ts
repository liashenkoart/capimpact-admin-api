import {ArgsType, Field, ID} from 'type-graphql';
import { BaseArgs } from '@modules/common/dto/base.args';
import {IsOptional} from "class-validator";
import {Type} from "class-transformer";

@ArgsType()
export class KpiBenchmarksArgs extends BaseArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  industry_id?: number;
}
