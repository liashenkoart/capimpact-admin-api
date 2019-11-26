import { IsNotEmpty } from 'class-validator';
import { Generated } from 'typeorm';

export class IndustryCreationInput {
  @Generated('increment')
  id: number;

  @IsNotEmpty()
  name: string;
}
