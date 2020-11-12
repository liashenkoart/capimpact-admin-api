import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { IndustryTreeService } from './industry-tree.service';
import { IndustryTreeController } from './indutry-tree.controller';
import { IndustryTree } from './industry-tree.entity';
import { Company } from '../company/company.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([IndustryTree, Company]),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  controllers: [IndustryTreeController],
  providers: [IndustryTreeService],
  exports: [IndustryTreeService],
})
export class IndustryTreeModule {}