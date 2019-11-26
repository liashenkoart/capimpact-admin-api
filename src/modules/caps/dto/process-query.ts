import { IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessQueryInput {
  @IsOptional()
  @Type(() => Number)
  readonly industry_id?: number;

  @IsOptional()
  @Min(1)
  @Type(() => Number)
  readonly page?: number = 1;

  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  readonly limit?: number = 25;
}
