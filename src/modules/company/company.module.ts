import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyController } from './company.controller';
import { CompanyService  } from "./services/company.service";
import { CompanyGraphService  } from "./services/company.graph.service";
import { Company } from './company.entity';
import { Capability } from '../capability/capability.entity';
import { IndustryTree } from '../industry-tree/industry-tree.entity';
import { CapabilityTree } from '../capability-tree/capability-tree.entity';
import { Challenge } from '../challenge/challenge.entity';
import { GroupTag } from '../grouptag/group-tag.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Company, Capability, IndustryTree, CapabilityTree, Challenge, GroupTag])],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyGraphService],
  exports: [CompanyService, CompanyGraphService]
})
export class CompanyModule {}