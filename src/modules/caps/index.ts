import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

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
  Tag
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
  CapabilityGraphService,
  CompanyGraphService,
  IndustryGraphService,
  ProcessGraphService,
  TagService
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
  TagsController
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
      Tag
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HttpModule,
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
    TagsController
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
    CapabilityGraphService,
    CompanyGraphService,
    IndustryGraphService,
    ProcessGraphService,
    TagService
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
    TagService
  ],
})
export class CapsModule {}
