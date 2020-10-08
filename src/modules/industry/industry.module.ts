import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustryController } from './industry.controller';
import { IndustryService } from './industry.service';
import { Industry } from './industry.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Industry])],
  controllers: [IndustryController],
  providers: [IndustryService],
  exports: [IndustryService],
})
export class IndustryModule {}