import { InputType, Field, ID } from 'type-graphql';
import { IsNotEmpty, IsNumber, IsString} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class StartupCapsDto {

  @IsString()
  @IsNotEmpty()
  readonly cid: string;

  @ApiProperty()
  @IsNumber({},{each: true})
  capabilities: number[];
}