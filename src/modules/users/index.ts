import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DateScalar } from '@modules/common/scalars/date.scalar';
import { User } from './user.entity';
import { Process } from '../process/process.entity';
import { UsersService } from './user.service';
import { UserResolver } from './user.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UserResolver, DateScalar],
  exports: [UsersService],
})
export class UsersModule {}
