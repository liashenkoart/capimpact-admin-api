import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ValueDriverController } from './value-driver.controller';
import { ValueDriverService } from './value-driver.service';
import { ValueDriver } from './value-driver.entity';
import { Industry } from '../industry/industry.entity';
import { IndustryTree } from '../industry-tree/industry-tree.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([ValueDriver, Industry, IndustryTree]),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  controllers: [ValueDriverController],
  providers: [ValueDriverService],
  exports: [ValueDriverService]
})
export class ValueDriverModule {}