// Modules
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ValueDriverLibsModule } from '../value_driver_lib/value_driver_lib.module';
import { KpiLibModule } from '../kpi-lib/kpi-lib.module';
import { TagsModule } from '../tags/tags.module';

// Controllers
import { ValueDriverTreeontroller } from './value-driver-tree.controller';

// Services 
import { ValueDriverTreeService } from './value-driver-tree.service';

// Entities 
import { ValueDriverTree } from './value-driver-tree.entity';


@Module({
  imports: [
    ValueDriverLibsModule,
    KpiLibModule,
    TagsModule,
    TypeOrmModule.forFeature([ValueDriverTree]),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  controllers: [ValueDriverTreeontroller],
  providers: [ValueDriverTreeService],
  exports: [ValueDriverTreeService]
})
export class ValueDriverTreeModule {}