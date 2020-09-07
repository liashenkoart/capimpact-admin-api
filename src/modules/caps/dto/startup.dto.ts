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
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @Field({ nullable: true })
  @IsOptional()
  readonly description?: string;

  @ApiProperty()
  @Field(() => [ID])
  @IsOptional()
  tags: any[];

  // @ApiProperty()
  // @IsOptional()
  // capabilities?: any;
}
