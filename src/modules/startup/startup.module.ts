import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StartupController } from './startup.controller';
import { StartupService } from './startup.service';
import { Startup } from './startup.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Startup])],
  controllers: [StartupController],
  providers: [StartupService],
  exports: [StartupService]
})
export class StartupModule {}