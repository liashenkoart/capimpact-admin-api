import { ArgsType } from 'type-graphql';
import { BaseArgs } from '@modules/common/dto/base.args';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@ArgsType()
export class KpiBenchmarksArgs extends BaseArgs {}
