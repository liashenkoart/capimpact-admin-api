import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Connection } from 'typeorm';

import { UsersModule } from '@modules/users';
import { AuthModule } from '@modules/auth';
import { IndustriesModule } from '@modules/industries';
import { ProcessesModule } from '@modules/processes';

import { AppController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
    AuthModule,
    IndustriesModule,
    ProcessesModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class ApplicationModule {
  constructor(private readonly connection: Connection) {}
}

/*
import { ArticleModule } from './article/article.module';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import { TagModule } from './tag/tag.module';
ArticleModule, UserModule, ProfileModule, TagModule
*/
