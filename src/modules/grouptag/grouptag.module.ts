import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { GroupTagController } from './grouptag.controller';
import { GroupTagService } from './grouptag.service';
import { GroupTag } from './group-tag.entity';
import { Capability } from '../capability/capability.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([GroupTag, Capability]),
  PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [GroupTagController],
  providers: [GroupTagService],
  exports: [GroupTagService]
})
export class GroupTagModule {}