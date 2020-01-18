// import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module, CacheModule, CacheInterceptor } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { database, jwt } from './config';

import { User } from '@modules/users/user.entity';
import { Industry, Company, Process, Capability } from '@modules/caps/entities';

import { UsersModule } from '@modules/users';
import { AuthModule } from '@modules/auth';
import { CapsModule } from '@modules/caps';

//import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [database, jwt],
    }),
    /*
    CacheModule.register({
      ttl: 60, // secs
    }),
    */
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: configService.get('database.type'),
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.db'),
        synchronize: true,
        logging: true,
        migrationsRun: true,
        entities: [User, Industry, Company, Process, Capability],
        migrations: ['src/migration/*.ts'],
        cli: {
          migrationsDir: 'src/migration',
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    UsersModule,
    CapsModule,
    GraphQLModule.forRoot({
      //include: [UsersModule],
      autoSchemaFile: 'schema.gql',
      installSubscriptionHandlers: true,
      context: ({ req }) => ({ req }),
    }),
  ],
  //controllers: [AppController],
  providers: [
    /*
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    */
  ],
})
export class ApplicationModule {}
