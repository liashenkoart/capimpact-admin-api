import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { KpiBenchmarkController } from './kpi-benchmark.controller';
import { KpiBenchmarkService } from './kpi-benchmark.service';
import { KpiBenchmark } from './kpi-benchmark.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([KpiBenchmark]),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  controllers: [KpiBenchmarkController],
  providers: [KpiBenchmarkService],
  exports: [KpiBenchmarkService]
})
export class KpiBenchMarkModule {}