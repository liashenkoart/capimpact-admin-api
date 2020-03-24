import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

// Modules
import { Neo4jModule } from '@modules/neo4j';

// Entities
import {
  Industry,
  Process,
  Capability,
  Company,
  Challenge,
  Startup,
  Lense,
  Classification,
  GroupTag,
  GroupFilter,
  KpiLib,
  Benchmark,
} from '@modules/caps/entities';

// Services
import {
  IndustryService,
  ProcessService,
  CapabilityService,
  CompanyService,
  ChallengeService,
  StartupService,
  LenseService,
  KpiLibService,
  GroupTagService,
  GroupFilterService,
} from '@modules/caps/services';

// Controllers
import {
  IndustryController,
  ProcessController,
  CapabilityController,
  CompanyController,
  ChallengeController,
  StartupController,
  LenseController,
  KpiLibController,
  GroupTagController,
  GroupFilterController,
} from '@modules/caps/controllers';

// Resolvers
import { IndustryResolver, ProcessResolver, CapabilityResolver } from '@modules/caps/resolvers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Industry,
      Process,
      Capability,
      Company,
      Challenge,
      Startup,
      Lense,
      Classification,
      GroupTag,
      GroupFilter,
      KpiLib,
      Benchmark,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HttpModule,
    Neo4jModule,
  ],
  controllers: [
    IndustryController,
    ProcessController,
    CapabilityController,
    CompanyController,
    ChallengeController,
    StartupController,
    LenseController,
    KpiLibController,
    GroupTagController,
    GroupFilterController,
  ],
  providers: [
    ProcessService,
    IndustryService,
    CapabilityService,
    CompanyService,
    ChallengeService,
    IndustryResolver,
    ProcessResolver,
    CapabilityResolver,
    StartupService,
    LenseService,
    KpiLibService,
    GroupTagService,
    GroupFilterService,
  ],
  exports: [
    IndustryService,
    ProcessService,
    CapabilityService,
    CompanyService,
    ChallengeService,
    StartupService,
    LenseService,
    KpiLibService,
    GroupTagService,
    GroupFilterService,
  ],
})
export class CapsModule {}
