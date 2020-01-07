import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

// Entities
import { Industry, Process, Capability, Company } from '@modules/caps/entities';

// Services
import {
  IndustryService,
  ProcessService,
  CapabilityService,
  CompanyService,
} from '@modules/caps/services';

// Controllers
import {
  IndustryController,
  ProcessController,
  CapabilityController,
  CompanyController,
} from '@modules/caps/controllers';

// Resolvers
import { IndustryResolver, ProcessResolver, CapabilityResolver } from '@modules/caps/resolvers';

@Module({
  imports: [
    TypeOrmModule.forFeature([Industry, Process, Capability, Company]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HttpModule,
  ],
  controllers: [IndustryController, ProcessController, CapabilityController, CompanyController],
  providers: [
    ProcessService,
    IndustryService,
    CapabilityService,
    CompanyService,
    IndustryResolver,
    ProcessResolver,
    CapabilityResolver,
  ],
  exports: [IndustryService, ProcessService, CapabilityService],
})
export class CapsModule {}
