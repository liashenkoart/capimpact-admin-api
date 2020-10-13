import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ClassificationInput } from '../../classifications/classifications.dto';
import { Classification } from '../../classifications/classification.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class CapabilityInput {
  @ApiProperty()
  @Field(() => ID)
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly id: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly name?: string;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly capitalCosts?: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly fte?: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly salaryCosts?: number;

  @ApiProperty()
  @IsOptional()
  readonly tags?: any;

  @ApiProperty()
  @IsOptional()
  readonly kpis?: any;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly hierarchy_id?: string;

  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly industry_id?: number;

  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly company_id?: number;

  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly parentId?: number;

  @ApiProperty()
  @IsOptional()
  readonly classifications?: ClassificationInput[];
}
