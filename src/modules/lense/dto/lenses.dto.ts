import { ArgsType, Field, ID } from 'type-graphql';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { BaseArgs } from '../../common/dto/base.args';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@ArgsType()
export class LensesArgs extends BaseArgs {}
