import { InputType, Field } from 'type-graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { BenefitType } from '../entities';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class KpiLibCreationInput {
  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly label: string;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  min?: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  max?: number;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly description?: string;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly kpi?: string;

  @ApiProperty()
  @Field(() => [String], { nullable: true })
  @IsOptional()
  readonly tags?: string[];

  @ApiProperty()
  @Field(() => [String], { nullable: true })
  @IsOptional()
  readonly types?: string[];

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly source?: string;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly benefitType?: BenefitType;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly is_active?: boolean;
}
