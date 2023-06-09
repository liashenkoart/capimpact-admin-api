import { InputType, Field, ID } from 'type-graphql';
import { IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Classification } from './classification.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class ClassificationInput extends Classification {
  // Add custom input for classification here
}
