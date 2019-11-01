import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { IndustriesModule } from '@modules/industries';
import { ProcessController } from './process.controller';
import { ProcessService } from './process.service';
import { Process } from './process.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Process]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    IndustriesModule,
  ],
  controllers: [ProcessController],
  providers: [ProcessService],
  exports: [ProcessService],
})
export class ProcessesModule {}
