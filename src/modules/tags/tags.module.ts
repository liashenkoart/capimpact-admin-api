import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { TagService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from './tag.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Tag]),
    PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [TagsController],
  providers: [TagService],
  exports: [TagService]
})
export class TagsModule {}