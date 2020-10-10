import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KpiLibController } from './kpi-lib.controller';
import { KpiLibService } from './kpi-lib.service';
import { KpiLib } from './kpi-lib.entity';
import { CapabilityLib } from '../capability-libs/capability-lib.entity';
import { Tag } from '../tags/tag.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([KpiLib, CapabilityLib, Tag])],
  controllers: [KpiLibController],
  providers: [KpiLibService],
  exports: [KpiLibService]
})
export class KpiLibModule {}