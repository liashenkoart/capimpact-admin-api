import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessGraphService, ProcessService } from './services';
import { ProcessController } from './process.controller';
import { Process } from './process.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Process])],
  controllers: [ProcessController],
  providers: [ProcessService, ProcessGraphService],
  exports: [ProcessService, ProcessGraphService],
})
export class ProcessModule {}