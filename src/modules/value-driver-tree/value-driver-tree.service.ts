import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryBuilder, TreeRepository } from 'typeorm';
import { ValueDriverLibService } from '../value_driver_lib/value_driver_lib.service';
import { ValudDriverType } from './velue-driver-type.enum';
import { ValueDriverTree } from './value-driver-tree.entity';

import { KpiLibService } from '../kpi-lib/kpi-lib.service';

import { map } from 'lodash';

@Injectable()
export class ValueDriverTreeService {  
    constructor(
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

  private findNode(params) {
    return this.valueDriverTreeRepository.findOne(params);
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

  async updateNodeKpis(id,dto):Promise<any> {
    const { kpis } = dto;

    const list = await this.kpisSrv.findManyKpisByIds(kpis)

    const node = await this.findNode({ where: { id }});

          node.kpis = map(list,'id');

    await this.treeRepository.save(node);

    return this.getNodeWithAgreggatedKpisAndTags(id);
  }

  async toggleNode({ value_driver_lib_id, type }) {
       const [valueDriverLib,entity, parent] = await Promise.all([await this.valueDriverLib.findOneSimple(value_driver_lib_id),
                                                                  await this.treeRepository.findOne({ value_driver_lib_id, type }), 
                                                                  await this.getMasterRootNode()]);
       const { name, tags } = valueDriverLib;

       if(!entity) {
          const node = await this.treeRepository.save(new ValueDriverTree({ name, tags, type, parent, value_driver_lib_id }))
          return { node, action: 'added'}
        } else {
          const node = await this.treeRepository.remove(entity);
          return { node, action: 'deleted' }
       }
  }
}
