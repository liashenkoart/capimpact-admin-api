import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapabilityController } from './capability.controller';
import { CapabilityService, CapabilityGraphService } from './services';
import { Capability } from './capability.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Capability]),
 ],
  controllers: [CapabilityController],
  providers: [CapabilityService, CapabilityGraphService],
  exports: [CapabilityService, CapabilityGraphService],
})
export class CapabilityModule {}