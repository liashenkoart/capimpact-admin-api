import { IsNotEmpty } from 'class-validator';

export class IndustryInput {
  @IsNotEmpty()
  readonly name: string;
}
