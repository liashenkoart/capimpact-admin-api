// import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  Module,
  // CacheModule, CacheInterceptor
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { DrivineModule, DrivineModuleOptions } from '@liberation-data/drivine/DrivineModule';
import { DatabaseRegistry } from '@liberation-data/drivine/connection/DatabaseRegistry';
import { User } from '@modules/users/user.entity';

import { UsersModule } from '@modules/users';
import { AuthModule } from '@modules/auth';

import { AppController } from './app.controller';




import { CapabilityModule } from './modules/capability/capability.module';
import { CapabilityLibsModule } from './modules/capability-libs/capability-libs.module';
import { CapabilityTreeModule } from './modules/capability-tree/capability-tree.module';
import { ChallengeModule } from './modules/challenge/challenge.module';
import { CompanyModule } from './modules/company/company.module';
import { GroupFilterModule } from './modules/groupfilter/groupfilter.module';
import { GroupTagModule } from './modules/grouptag/grouptag.module';
import { IndustryModule } from './modules/industry/industry.module';
import { IndustryTreeModule } from './modules/industry-tree/industry-tree.module';
import { KpiBenchMarkModule } from './modules/kpi-benchmark/kpi-benchmark.module';
import { KpiLibModule } from './modules/kpi-lib/kpi-lib.module';
import { LenseModule } from './modules/lense/lense.module';
import { ProcessModule } from './modules/process/process.module';
import { StartupModule } from './modules/startup/startup.module';
import { TagsModule } from './modules/tags/tags.module';
import { TechnologyModule } from './modules/technology/technology.module';
import { ValueDriverModule } from './modules/value-driver/value-driver.module';




import { Process } from "./modules/process/process.entity"
import { Industry } from "./modules/industry/industry.entity"


import { IndustryTree } from "./modules/industry-tree/industry-tree.entity";
import { Company } from "./modules/company/company.entity";
import { Challenge } from "./modules/challenge/challenge.entity";
import { Capability } from "./modules/capability/capability.entity";
import { CapabilityLib } from "./modules/capability-libs/capability-lib.entity";
import { CapabilityTree } from "./modules/capability-tree/capability-tree.entity";
import { Startup } from "./modules/startup/startup.entity";
import { Classification } from "./modules/classifications/classification.entity";
import { Lense } from "./modules/lense/lense.entity";
import { GroupTag } from "./modules/grouptag/group-tag.entity";
import { GroupFilter } from "./modules/groupfilter/groupfilter.entity";
import { KpiLib } from "./modules/kpi-lib/kpi-lib.entity";
import { Benchmark } from "./modules/benchmark/benchmark.entity";
import { ValueDriver } from "./modules/value-driver/value-driver.entity";
import { KpiBenchmark } from "./modules/kpi-benchmark/kpi-benchmark.entity";
import { Tag } from "./modules/tags/tag.entity";
import { Technology } from "./modules/technology/technology.entity";
import { Sic } from './modules/common/entities/sic.entity';


          // Sic,
          // Tag,
          // Technology







export const MODULE = {
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: Object.values(require('./config')),
    }),
    /*
    CacheModule.register({
      ttl: 60, // secs
    }),
    */
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        ...configService.get('database').default,
        entities: [
          User,
          Process,
          Industry,
          IndustryTree,
          Company,
          Challenge,
          Process,
          Capability,
          CapabilityLib,
          CapabilityTree,
          Startup,
          Classification,
          Lense,
          GroupTag,
          GroupFilter,
          KpiLib,
          Benchmark,
          ValueDriver,
          KpiBenchmark,
          Sic,
          Tag,
          Technology
        ],
      }),
      inject: [ConfigService],
    }),

    DrivineModule.withOptions(<DrivineModuleOptions>{
      connectionProviders: [DatabaseRegistry.buildOrResolveFromEnv('GRAPH')]
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    UsersModule,
    CapabilityModule,
    IndustryModule,
    CapabilityLibsModule,
    CapabilityTreeModule,
    ChallengeModule,
    CompanyModule,
    GroupFilterModule,
    GroupTagModule,
    IndustryTreeModule,
    KpiBenchMarkModule,
    KpiLibModule,
    LenseModule,
    ProcessModule,
    StartupModule,
    TagsModule,
    TechnologyModule,
    ValueDriverModule
  ],

  controllers: [AppController],
  providers: [
    /*
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    */
  ],
};
@Module(MODULE)
export class ApplicationModule {}
