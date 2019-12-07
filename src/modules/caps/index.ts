import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

// Entities
import {
  Industry,
  Process,
  DefaultProcess,
  Capability,
  DefaultCapability,
  Company,
} from '@modules/caps/entities';

// Services
import { IndustryService, ProcessService, CapabilityService } from '@modules/caps/services';

// Controllers
import {
  IndustryController,
  ProcessController,
  CapabilityController,
} from '@modules/caps/controllers';

// Resolvers
import { IndustryResolver } from '@modules/caps/resolvers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Industry,
      DefaultProcess,
      Process,
      DefaultCapability,
      Capability,
      Company,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [IndustryController, ProcessController, CapabilityController],
  providers: [ProcessService, IndustryService, CapabilityService, IndustryResolver],
  exports: [IndustryService, ProcessService, CapabilityService],
})
export class CapsModule {}
