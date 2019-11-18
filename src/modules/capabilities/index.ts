import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { IndustriesModule } from '@modules/industries';
import { CapabilityController } from './capability.controller';
import { CapabilityService } from './capability.service';
import { Capability } from './capability.entity';
//import { DefaultCapability } from './default-capability.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Capability]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => IndustriesModule),
  ],
  controllers: [CapabilityController],
  providers: [CapabilityService],
  exports: [CapabilityService],
})
export class CapabilitiesModule {}
