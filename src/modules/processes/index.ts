import { Module, forwardRef } from '@nestjs/common';
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
    forwardRef(() => IndustriesModule),
  ],
  controllers: [ProcessController],
  providers: [ProcessService],
  exports: [ProcessService],
})
export class ProcessesModule {}
