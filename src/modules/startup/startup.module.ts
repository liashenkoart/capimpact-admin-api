import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { StartupController } from './startup.controller';
import { StartupService } from './startup.service';
import { Startup } from './startup.entity';
import { Capability } from '../capability/capability.entity';
import { CapabilityTree } from '../capability-tree/capability-tree.entity';
import { Tag } from '../tags/tag.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Startup, Capability, Tag, CapabilityTree]),
    PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [StartupController],
  providers: [StartupService],
  exports: [StartupService]
})
export class StartupModule {}