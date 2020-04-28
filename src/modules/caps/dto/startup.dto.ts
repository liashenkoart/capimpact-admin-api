import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class StartupInput {
  @ApiProperty()
  @Field(() => ID)
  @IsOptional()
  readonly cid?: string;

  @ApiProperty()
  @Field()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsOptional()
  capabilities?: any;
}
