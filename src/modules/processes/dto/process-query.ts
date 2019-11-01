import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessQueryInput {
  @IsOptional()
  @Type(() => Number)
  readonly industry_id: number;

  @IsOptional()
  @Type(() => Number)
  readonly page?: number;

  @IsOptional()
  @Type(() => Number)
  readonly limit?: number;
}
