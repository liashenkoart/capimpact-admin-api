import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupFilterController } from './groupfilter.controller';
import { GroupFilterService } from './groupfilter.service';
import { GroupFilter } from './groupfilter.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([GroupFilter])],
  controllers: [GroupFilterController],
  providers: [GroupFilterService],
  exports: [GroupFilterService],
})
export class GroupFilterModule {}