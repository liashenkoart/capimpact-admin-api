import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

// Modules
import { Neo4jModule } from '@modules/neo4j';

// Entities
import {
  Industry,
  IndustryTree,
  Process,
  Capability,
  CapabilityLib,
  CapabilityTree,
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
  IndustryTreeService,
  ProcessService,
  CapabilityService,
  CapabilityLibService,
  CapabilityTreeService,
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
  IndustryTreeController,
  ProcessController,
  CapabilityController,
  CapabilityLibController,
  CapabilityTreeController,
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
      IndustryTree,
      Process,
      Capability,
      CapabilityLib,
      CapabilityTree,
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
    IndustryTreeController,
    ProcessController,
    CapabilityController,
    CapabilityLibController,
    CapabilityTreeController,
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
    IndustryTreeService,
    CapabilityService,
    CapabilityLibService,
    CapabilityTreeService,
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
    IndustryTreeService,
    ProcessService,
    CapabilityService,
    CapabilityLibService,
    CapabilityTreeService,
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
