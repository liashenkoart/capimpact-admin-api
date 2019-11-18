import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Connection } from 'typeorm';

import { UsersModule } from '@modules/users';
import { AuthModule } from '@modules/auth';
import { IndustriesModule } from '@modules/industries';
import { ProcessesModule } from '@modules/processes';
import { CapabilitiesModule } from '@modules/capabilities';

import { AppController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
    AuthModule,
    IndustriesModule,
    ProcessesModule,
    CapabilitiesModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class ApplicationModule {
  constructor(private readonly connection: Connection) {}
}
