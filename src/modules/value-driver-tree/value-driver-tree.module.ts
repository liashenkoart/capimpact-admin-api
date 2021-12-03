// Modules
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ValueDriverLibsModule } from '../value_driver_lib/value_driver_lib.module';
import { KpiLibModule } from '../kpi-lib/kpi-lib.module';
import { TagsModule } from '../tags/tags.module';
import { IndustryTreeModule } from '../industry-tree/industry-tree.module'

// Controllers
import { VDMasterController,
         VDTreeController,
         VDIndustryController } from './controllers/index'

// Services 
import { VDMasterTreeService, VDIndustryTreeService, VDTreeService } from './services';

// Entities 
import { ValueDriverTree } from './value-driver-tree.entity';


@Module({
  imports: [
    ValueDriverLibsModule,
    IndustryTreeModule,
    KpiLibModule,
    TagsModule,
    TypeOrmModule.forFeature([ValueDriverTree]),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  controllers: [
    VDMasterController,
    VDIndustryController,
    VDTreeController
  ],
  providers: [
    VDMasterTreeService,
    VDTreeService,
    VDIndustryTreeService],
  exports: [
    VDMasterTreeService,
    VDTreeService,
    VDIndustryTreeService]
})
export class ValueDriverTreeModule {}