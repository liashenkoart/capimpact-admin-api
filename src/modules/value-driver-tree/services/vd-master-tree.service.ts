import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryBuilder, TreeRepository } from 'typeorm';
import { ValudDriverType } from '../velue-driver-type.enum';
import { ValueDriverTree } from '../value-driver-tree.entity';

// Services 
import { KpiLibService } from '../../kpi-lib/kpi-lib.service';
import { TagService } from '../../tags/tags.service';
import { ValueDriverLibService } from '../../value_driver_lib/value_driver_lib.service';
import { VDTreeService } from './vd-tree.service';

@Injectable()
export class VDMasterTreeService extends VDTreeService {  
    constructor(
       @InjectRepository(ValueDriverTree) public readonly treeRepository: TreeRepository<ValueDriverTree>,
       @InjectRepository(ValueDriverTree) public readonly valueDriverTreeRepository: Repository<ValueDriverTree>,
       public tagService: TagService,
       public valueDriverLib: ValueDriverLibService,
       public kpisSrv: KpiLibService,) {
        super(tagService,kpisSrv,treeRepository);
       }

  async getMasterRootNode(): Promise<ValueDriverTree> {
    const rootNode = await this.queryBuilder()
                                   .select('id')
                                   .where('type = :type', { type: ValudDriverType.MASTER})
                                   .andWhere('tree.parentId IS NULL')
                                   .getRawOne();

    if(rootNode) {
        return rootNode;
    } else {
        const { raw: [entity] } =  await this.queryBuilder()
        .insert()
        .into(ValueDriverTree)
        .values({ name: 'Master Value Driver', type: ValudDriverType.MASTER })
        .returning(['name','description','tags','kpis'])
        .execute();
        return entity;
    }
  }

  async getMasterTree() {
    const root = await this.getMasterRootNode();
 
    return await this.treeRepository.findDescendantsTree(root);
  }

  async moveNode({ nodeId, parentId }) {
    const [node, parent] = await Promise.all([ await this.findNode({ where: { id: nodeId }}),
                                               await this.findNode({ where: { id: parentId }})]);
       node.parent = parent;

     return this.valueDriverTreeRepository.save(node);
  }

  async updateMasterNodeKpis(id,dto) {
    return this.updateNodeKpis(id,dto);
  }


  async updateMasterNodeTags(id,dto) {
    return this.updateNodeTags(id,dto);
  }

  async moverToMasterRoot(nodeId) {
    const node =  await this.findNode({ where: { id: nodeId }});

          node.parent = await this.getMasterRootNode()

    return this.valueDriverTreeRepository.save(node);
  }


  async getMasterBranchByParent(params = { }): Promise<ValueDriverTree[]> {
    const masterRoot = await this.findNode(params);

    const masterDescendants = await this.treeRepository.findDescendants(masterRoot);

    return masterDescendants;
  }

  async addNode({ value_driver_lib_id }) {
       const [valueDriverLib, parent] = await Promise.all([await this.valueDriverLib.findOneSimple(value_driver_lib_id),
                                                           await this.getMasterRootNode()]);
       const { name, tags } = valueDriverLib;

       return await this.treeRepository.save(new ValueDriverTree({ name, tags, type: ValudDriverType.MASTER, parent, value_driver_lib_id }))
  }
}
