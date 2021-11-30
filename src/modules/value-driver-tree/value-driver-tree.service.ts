import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryBuilder, TreeRepository } from 'typeorm';
import { ValudDriverType } from './velue-driver-type.enum';
import { ValueDriverTree } from './value-driver-tree.entity';

// Services 
import { KpiLibService } from '../kpi-lib/kpi-lib.service';
import { TagService } from '../tags/tags.service';
import { ValueDriverLibService } from '../value_driver_lib/value_driver_lib.service';

// Libs
import { map } from 'lodash';

@Injectable()
export class ValueDriverTreeService {  
    constructor(
       private tagService: TagService,
       private valueDriverLib: ValueDriverLibService,
       private kpisSrv: KpiLibService,
       @InjectRepository(ValueDriverTree) public readonly treeRepository: TreeRepository<ValueDriverTree>,
       @InjectRepository(ValueDriverTree) private readonly valueDriverTreeRepository: Repository<ValueDriverTree>) {}


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

  private queryBuilder(): QueryBuilder<ValueDriverTree> {
    return this.valueDriverTreeRepository.createQueryBuilder('tree');
  }

  private async findNode(params) {
    const node = await this.valueDriverTreeRepository.findOne(params);
   
    if(!node) throw new NotFoundException('Node not found');
    
    return node;
  }

  async getMasterTree() {
   const root = await this.getMasterRootNode();
 
   return await this.treeRepository.findDescendantsTree(root, { });
  }

  async moveNode({ nodeId, parentId }) {
    const [node, parent] = await Promise.all([ await this.findNode({ where: { id: nodeId }}),
                                               await this.findNode({ where: { id: parentId }})]);
       node.parent = parent;

     return this.valueDriverTreeRepository.save(node);
  }

  async moverToMasterRoot(nodeId) {
    const node =  await this.findNode({ where: { id: nodeId }});

          node.parent = await this.getMasterRootNode()

    return this.valueDriverTreeRepository.save(node);
  }

  async getNodeWithAgreggatedKpisAndTags(id: number) {
     const node = await this.queryBuilder()
                 .select('*')
                 .addSelect(`(SELECT coalesce(json_agg(json_build_object('id',tags.id,'value',tags.value)), '[]'::json) FROM tags WHERE tree.tags @> to_jsonb(ARRAY[tags.id]) )`,'tags')
                 .addSelect(`(SELECT coalesce(json_agg(json_build_object('id',kpi_libs.id,'label',kpi_libs.label)), '[]'::json) FROM kpi_libs WHERE tree.kpis @> to_jsonb(ARRAY[kpi_libs.id]) )`,'kpis')
                 .where('tree.id = :id', { id })
                 .getRawOne();

      return node;
  }

  private  async saveNode(node) {
     const { id } =  await this.treeRepository.save(node);
     return this.getNodeWithAgreggatedKpisAndTags(id);
   } 

  async updateNodeKpis(id: number,{ kpis }):Promise<any> {
    const node = await this.findNode({ where: { id }});

    const list = await this.kpisSrv.findManyKpisByIds(kpis)

          node.kpis = map(list,'id');

    return this.saveNode(node);
  }

  async updateNodeTags(id: number,{ tags }):Promise<any> {
    
     const node = await this.findNode({ where: { id }});

     node.tags = await this.tagService.insertTagsIfNew(tags);

     return this.saveNode(node);
  }

  async removeNode(id) {
    const node = await this.findNode({ where: { id }})

    return await this.treeRepository.remove(node,{ });
  }

  async addNode({ value_driver_lib_id, type }) {
       const [valueDriverLib, parent] = await Promise.all([await this.valueDriverLib.findOneSimple(value_driver_lib_id),
                                                           await this.getMasterRootNode()]);
       const { name, tags } = valueDriverLib;

       return await this.treeRepository.save(new ValueDriverTree({ name, tags, type, parent, value_driver_lib_id }))
  }
}
