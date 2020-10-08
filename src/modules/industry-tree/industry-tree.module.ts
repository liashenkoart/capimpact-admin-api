import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustryTreeService } from './industry-tree.service';
import { IndustryTreeController } from './indutry-tree.controller';
import { IndustryTree } from './industry-tree.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([IndustryTree])],
  controllers: [IndustryTreeController],
  providers: [IndustryTreeService],
  exports: [IndustryTreeService],
})
export class IndustryTreeModule {}