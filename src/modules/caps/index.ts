import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

// Entities
import { Industry, Process, Capability, Company, Startup } from '@modules/caps/entities';

// Services
import {
  IndustryService,
  ProcessService,
  CapabilityService,
  CompanyService,
  StartupService,
} from '@modules/caps/services';

// Controllers
import {
  IndustryController,
  ProcessController,
  CapabilityController,
  CompanyController,
  StartupController,
} from '@modules/caps/controllers';

// Resolvers
import { IndustryResolver, ProcessResolver, CapabilityResolver } from '@modules/caps/resolvers';

@Module({
  imports: [
    TypeOrmModule.forFeature([Industry, Process, Capability, Company, Startup]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HttpModule,
  ],
  controllers: [
    IndustryController,
    ProcessController,
    CapabilityController,
    CompanyController,
    StartupController,
  ],
  providers: [
    ProcessService,
    IndustryService,
    CapabilityService,
    CompanyService,
    IndustryResolver,
    ProcessResolver,
    CapabilityResolver,
    StartupService,
  ],
  exports: [IndustryService, ProcessService, CapabilityService, CompanyService, StartupService],
})
export class CapsModule {}
