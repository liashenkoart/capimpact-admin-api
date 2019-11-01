import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class ProcessCreationInput {
  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  @IsNumber()
  readonly industry_id: number;

  @IsOptional()
  readonly pcf_id?: string;

  @IsOptional()
  readonly hierarchy_id?: string;

  @IsOptional()
  readonly difference_idx?: string;

  @IsOptional()
  readonly change_details?: string;

  @IsOptional()
  readonly metrics_avail?: boolean;

  @IsOptional()
  @IsNumber()
  readonly parent_id: number;
}
