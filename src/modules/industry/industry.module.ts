import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustryController } from './industry.controller';
import { IndustryService, IndustryGraphService } from './service';
import { Industry } from './industry.entity';
import { IndustryResolver } from './industry.resolver';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Industry])],
  controllers: [IndustryController],
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