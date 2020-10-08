import { ArgsType } from 'type-graphql';
import { BaseArgs } from '../../common/dto/base.args';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@ArgsType()
export class IndustriesArgs extends BaseArgs {}
