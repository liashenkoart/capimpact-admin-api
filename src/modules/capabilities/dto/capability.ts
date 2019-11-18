import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CapabilityInput {
  @IsOptional()
  @IsNumber()
  readonly id?: number;

  @IsNotEmpty()
  readonly name: string;

  @IsOptional()
  @IsNumber()
  readonly industry_id?: number;

  @IsOptional()
  readonly hierarchy_id?: string;

  @IsOptional()
  @IsNumber()
  readonly parent_id?: number;
}
