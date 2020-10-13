import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapabilityController } from './capability.controller';
import { CapabilityService } from './services/capability.service';
import { CapabilityGraphService } from './services/capability.graph.service';
import { CapabilityResolver} from './resolvers/capability.resolver';
import { Capability } from './capability.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Capability]),
 ],
  controllers: [CapabilityController],
  providers: [
    CapabilityService, 
    CapabilityGraphService, 
    CapabilityResolver
  ],
  exports: [
    CapabilityService, 
    CapabilityGraphService, 
    CapabilityResolver
  ],
})
export class CapabilityModule {}