import { InputType, Field, ID } from 'type-graphql';
import { IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Classification } from '../entities';

@InputType()
export class ClassificationInput extends Classification {
  // Add custom input for classification here
}
