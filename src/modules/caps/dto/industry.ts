import { IsNotEmpty } from 'class-validator';

export class IndustryInput {
  @IsNotEmpty()
  name: string;
}
