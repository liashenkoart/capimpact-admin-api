import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapabilityTreeController } from './capability-tree.controller';
import { CapabilityTreeService } from './capability-tree.service';
import { CapabilityTree } from './capability-tree.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([CapabilityTree])],
  controllers: [CapabilityTreeController],
  providers: [CapabilityTreeService],
  exports: [CapabilityTreeService],
})
export class CapabilityTreeModule {}