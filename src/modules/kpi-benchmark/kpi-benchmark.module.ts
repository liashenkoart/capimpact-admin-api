import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KpiBenchmarkController } from './kpi-benchmark.controller';
import { KpiBenchmarkService } from './kpi-benchmark.service';
import { KpiBenchmark } from './kpi-benchmark.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([KpiBenchmark])],
  controllers: [KpiBenchmarkController],
  providers: [KpiBenchmarkService],
  exports: [KpiBenchmarkService]
})
export class KpiBenchMarkModule {}