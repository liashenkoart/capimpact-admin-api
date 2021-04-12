import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OntoTree } from './ontotree.entity';
import { OntoTreeController } from './ontotree.controller';
import { OntoTreeService } from './ontotree.service';

@Module({
  imports: [TypeOrmModule.forFeature([OntoTree])],
  controllers: [OntoTreeController],
  providers: [OntoTreeService],
  exports: [OntoTreeService]
})
export class OntoTreeModule {}