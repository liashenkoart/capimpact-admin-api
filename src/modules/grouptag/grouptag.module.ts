import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupTagController } from './grouptag.controller';
import { GroupTagService } from './grouptag.service';
import { GroupTag } from './group-tag.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([GroupTag])],
  controllers: [GroupTagController],
  providers: [GroupTagService],
  exports: [GroupTagService]
})
export class GroupTagModule {}