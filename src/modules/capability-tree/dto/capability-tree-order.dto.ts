
import { IsNumber } from 'class-validator';

export  class CapabilityTreeOrderDto {
  @IsNumber()
  id: number;

  @IsNumber()
  order: number;
}