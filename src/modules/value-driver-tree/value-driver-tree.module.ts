import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ValueDriverTreeontroller } from './value-driver-tree.controller';
import { ValueDriverTreeService } from './value-driver-tree.service';
import { ValueDriverTree } from './value-driver-tree.entity';
import { ValueDriverLibsModule } from '../value_driver_lib/value_driver_lib.module';

@Module({
  imports: [
    ValueDriverLibsModule,
    TypeOrmModule.forFeature([ValueDriverTree]),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  controllers: [ValueDriverTreeontroller],
  providers: [ValueDriverTreeService],
  exports: [ValueDriverTreeService]
})
export class ValueDriverTreeModule {}