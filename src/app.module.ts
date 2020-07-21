// import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  Module,
  // CacheModule, CacheInterceptor
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

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
  Sic,
} from '@modules/caps/entities';

import { UsersModule } from '@modules/users';
import { AuthModule } from '@modules/auth';
import { Neo4jModule, createNeo4jGraphQL } from '@modules/neo4j';
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
          Sic,
        ],
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const { schema, driver } = createNeo4jGraphQL({ configService });
        return {
          //include: [UsersModule],
          schema,
          //autoSchemaFile: 'schema.gql',
          //installSubscriptionHandlers: true,
          context: ({ req }) => ({ req, driver }),
        };
      },
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    Neo4jModule,

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
