import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from './tag.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  controllers: [TagsController],
  providers: [TagService],
  exports: [TagService]
})
export class TagsModule {}