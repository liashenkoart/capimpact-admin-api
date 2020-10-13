import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapabilityTreeController } from './capability-tree.controller';
import { CapabilityTreeService } from './capability-tree.service';
import { CapabilityTree } from './capability-tree.entity';
import { CapabilityLib } from '../capability-libs/capability-lib.entity';
import { IndustryTree } from '../industry-tree/industry-tree.entity';
import { Capability } from '../capability/capability.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([CapabilityTree, IndustryTree ,CapabilityLib, Capability]),
  ],
  controllers: [CapabilityTreeController],
  providers: [CapabilityTreeService],
  exports: [CapabilityTreeService],
})
export class CapabilityTreeModule {}