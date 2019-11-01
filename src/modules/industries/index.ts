import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { IndustryController } from './industry.controller';
import { IndustryService } from './industry.service';
import { Industry } from './industry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Industry]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [IndustryController],
  providers: [IndustryService],
  exports: [IndustryService],
})
export class IndustriesModule {}
