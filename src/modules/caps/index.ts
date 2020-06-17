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
  CapabilityLib,
  Company,
  Challenge,
  Startup,
  Lense,
  Classification,
  GroupTag,
  GroupFilter,
  KpiLib,
  Benchmark,
  ValueDriver,
  KpiBenchmark,
} from '@modules/caps/entities';

// Services
import {
  IndustryService,
  ProcessService,
  CapabilityService,
  CapabilityLibService,
  CompanyService,
  ChallengeService,
  StartupService,
  LenseService,
  KpiLibService,
  GroupTagService,
  GroupFilterService,
  ValueDriverService,
  KpiBenchmarkService,
} from '@modules/caps/services';

// Controllers
import {
  IndustryController,
  ProcessController,
  CapabilityController,
  CapabilityLibController,
  CompanyController,
  ChallengeController,
  StartupController,
  LenseController,
  KpiLibController,
  GroupTagController,
  GroupFilterController,
  ValueDriverController,
  KpiBenchmarkController,
} from '@modules/caps/controllers';

// Resolvers
import { IndustryResolver, ProcessResolver, CapabilityResolver } from '@modules/caps/resolvers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Industry,
      Process,
      Capability,
      CapabilityLib,
      Company,
      Challenge,
      Startup,
      Lense,
      Classification,
      GroupTag,
      GroupFilter,
      KpiLib,
      Benchmark,
      ValueDriver,
      KpiBenchmark,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HttpModule,
    Neo4jModule,
  ],
  controllers: [
    IndustryController,
    ProcessController,
    CapabilityController,
    CapabilityLibController,
    CompanyController,
    ChallengeController,
    StartupController,
    LenseController,
    KpiLibController,
    GroupTagController,
    GroupFilterController,
    ValueDriverController,
    KpiBenchmarkController,
  ],
  providers: [
    ProcessService,
    IndustryService,
    CapabilityService,
    CapabilityLibService,
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
    ValueDriverService,
    KpiBenchmarkService,
  ],
  exports: [
    IndustryService,
    ProcessService,
    CapabilityService,
    CapabilityLibService,
    CompanyService,
    ChallengeService,
    StartupService,
    LenseService,
    KpiLibService,
    GroupTagService,
    GroupFilterService,
    ValueDriverService,
    KpiBenchmarkService,
  ],
})
export class CapsModule {}
