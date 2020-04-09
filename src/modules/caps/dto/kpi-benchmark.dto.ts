import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class KpiBenchmarkInput {
  @ApiProperty()
  @Field(() => ID)
  @IsOptional()
  @IsNumber()
  readonly id?: number;

  @ApiProperty()
  @Field()
  @IsOptional()
  readonly benchmark?: number;
  
  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  readonly kpilibId?: number;
  
  @ApiProperty()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  readonly industryId?: number;
}
