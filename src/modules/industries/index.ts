import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

//import { UsersService } from './users.service';
import { Industry } from './industry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Industry])],
  providers: [],
  exports: [],
})
export class IndustriesModule {}
