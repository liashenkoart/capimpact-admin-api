import { Module, Global, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { CapabilityTreeController } from './capability-tree.controller';
import { CapabilityTreeService } from './capability-tree.service';
import { CapabilityTree } from './capability-tree.entity';
import { CapabilityLib } from '../capability-libs/capability-lib.entity';
import { IndustryTree } from '../industry-tree/industry-tree.entity';
import { Capability } from '../capability/capability.entity';
import { MasterCapabilityTree } from './master-capability-tree.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([CapabilityTree, IndustryTree ,CapabilityLib, Capability,MasterCapabilityTree]),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  controllers: [CapabilityTreeController],
  providers: [CapabilityTreeService],
  exports: [CapabilityTreeService],
})
export class CapabilityTreeModule {}