import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Connection } from 'typeorm';

import { UsersModule } from '@modules/users';
import { AuthModule } from '@modules/auth';
import { CapsModule } from '@modules/caps';

import { AppController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
    AuthModule,
    CapsModule,
    GraphQLModule.forRoot({
      //include: [UsersModule],
      autoSchemaFile: 'schema.gql',
      installSubscriptionHandlers: true,
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class ApplicationModule {
  constructor(private readonly connection: Connection) {}
}
