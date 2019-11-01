import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

//import { UsersService } from './users.service';
import { Process } from './process.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Process])],
  providers: [],
  exports: [],
})
export class ProcessesModule {}
