import { IsNotEmpty } from 'class-validator';

export class IndustryCreationInput {
  @IsNotEmpty()
  readonly name: string;
}
