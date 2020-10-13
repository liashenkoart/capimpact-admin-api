import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LenseController } from './lense.controller';
import { LenseService } from './lense.service';
import { Lense } from './lense.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Lense])],
  controllers: [LenseController],
  providers: [LenseService],
  exports: [LenseService],
})
export class LenseModule {}