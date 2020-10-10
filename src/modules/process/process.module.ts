import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessGraphService, ProcessService } from './services';
import { ProcessController } from './process.controller';
import { Process } from './process.entity';
import { Industry } from '../industry/industry.entity';
import { KpiLib } from '../kpi-lib/kpi-lib.entity';
import { IndustryTree } from '../industry-tree/industry-tree.entity';
import { ProcessResolver } from './process.resolver';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Process, Industry, KpiLib, IndustryTree])],
  controllers: [ProcessController],
  providers: [
    ProcessService,
    ProcessGraphService,
    ProcessResolver
  ],
  exports: [
    ProcessService, 
    ProcessGraphService, 
    ProcessResolver
  ],
})
export class ProcessModule {}