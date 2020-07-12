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
import {
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
  GroupTag,
  GroupFilter,
  Lense,
  KpiLib,
  Benchmark,
  ValueDriver,
  KpiBenchmark,
} from '@modules/caps/entities';

import { UsersModule } from '@modules/users';
import { AuthModule } from '@modules/auth';
import { CapsModule } from '@modules/caps';

import { AppController } from './app.controller';

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
    CapsModule,
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
