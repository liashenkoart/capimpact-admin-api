import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValueDriverController } from './value-driver.controller';
import { ValueDriverService } from './value-driver.service';
import { ValueDriver } from './value-driver.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ValueDriver])],
  controllers: [ValueDriverController],
  providers: [ValueDriverService],
  exports: [ValueDriverService]
})
export class ValueDriverModule {}