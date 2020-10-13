import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupTagController } from './grouptag.controller';
import { GroupTagService } from './grouptag.service';
import { GroupTag } from './group-tag.entity';
import { Capability } from '../capability/capability.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([GroupTag, Capability])],
  controllers: [GroupTagController],
  providers: [GroupTagService],
  exports: [GroupTagService]
})
export class GroupTagModule {}