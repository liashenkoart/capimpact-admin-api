import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { LenseController } from './lense.controller';
import { LenseService } from './lense.service';
import { Lense } from './lense.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Lense]),
    PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [LenseController],
  providers: [LenseService],
  exports: [LenseService],
})
export class LenseModule {}