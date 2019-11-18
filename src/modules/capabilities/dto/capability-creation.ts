import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CapabilityCreationInput {
  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  @IsNumber()
  readonly industry_id: number;

  @IsOptional()
  @IsNumber()
  readonly parent_id?: number;

  @IsOptional()
  readonly hierarchy_id?: string;
}
