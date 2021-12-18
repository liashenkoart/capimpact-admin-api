import { Injectable } from '@nestjs/common';
import { InjectRepository, } from '@nestjs/typeorm';
import { Repository, TreeRepository, FindOneOptions } from 'typeorm';
import { ValudDriverType } from '../velue-driver-type.enum';
import { ValueDriverTree } from '../value-driver-tree.entity';

// Services 
import { KpiLibService } from '../../kpi-lib/kpi-lib.service';
import { TagService } from '../../tags/tags.service';
import { ValueDriverLibService } from '../../value_driver_lib/value_driver_lib.service';
import { TechnologyService } from '../../technology/technology.service';

import { VDTreeService } from './vd-tree.service';

@Injectable()
export class VDMasterTreeService extends VDTreeService {  
   
   protected TREE_TYPE = ValudDriverType.MASTER;

    constructor(
       public tagService: TagService,
       public kpisSrv: KpiLibService,
       public valueDriverLib: ValueDriverLibService, 
      @InjectRepository(ValueDriverTree) public readonly treeRepository: TreeRepository<ValueDriverTree>,
       public technologiesSrv: TechnologyService,
       @InjectRepository(ValueDriverTree) public readonly valueDriverTreeRepository: Repository<ValueDriverTree>,) {
        super(tagService,kpisSrv,technologiesSrv,treeRepository);
      }

  async addNode({ value_driver_lib_id }) {
       const [valueDriverLib, parent] = await Promise.all([await this.valueDriverLib.findOneSimple(value_driver_lib_id),
                                                           await this.getTypeRootNode()]);
       const { name, tags } = valueDriverLib;

       return await this.treeRepository.save(new ValueDriverTree({ name, tags, type: ValudDriverType.MASTER, parent, value_driver_lib_id }))
  }
}
