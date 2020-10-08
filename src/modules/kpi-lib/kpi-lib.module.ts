import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KpiLibController } from './kpi-lib.controller';
import { KpiLibService } from './kpi-lib.service';
import { KpiLib } from './kpi-lib.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([KpiLib])],
  controllers: [KpiLibController],
  providers: [KpiLibService],
  exports: [KpiLibService]
})
export class KpiLibModule {}