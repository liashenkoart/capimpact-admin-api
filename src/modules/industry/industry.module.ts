import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustryController } from './industry.controller';
import { IndustryService } from './service/industry.service';
import { IndustryGraphService } from './service/industry.graph.service';
import { Industry } from './industry.entity';
import { IndustryResolver } from './industry.resolver';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Industry])
  ],
  controllers: [
    IndustryController
  ],
  providers: [
    IndustryService,
    IndustryGraphService, 
    IndustryResolver
  ],
  exports: [
    IndustryService, 
    IndustryGraphService, 
    IndustryResolver
  ],
})
export class IndustryModule {}