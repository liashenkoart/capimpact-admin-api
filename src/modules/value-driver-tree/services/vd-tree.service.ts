import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryBuilder, TreeRepository, FindOneOptions } from 'typeorm';
import { ValueDriverTree } from '../value-driver-tree.entity';
import { ValudDriverType } from '../velue-driver-type.enum';

// Services 
import { KpiLibService } from '../../kpi-lib/kpi-lib.service';
import { TagService } from '../../tags/tags.service';

// Libs
import { map } from 'lodash';
import { flattenTree } from '@app/lib/sorting';


@Injectable()
export class VDTreeService {  

  protected TREE_TYPE: ValudDriverType = ValudDriverType.MASTER;

    constructor(
        public tagService: TagService,
        public kpisSrv: KpiLibService,
        @InjectRepository(ValueDriverTree) public treeRepository: TreeRepository<ValueDriverTree>
    ) { }

    async getFullTree() {
      const root = await this.getTypeRootNode();
      return await this.treeRepository.findDescendantsTree(root);
    }


    async getTypeRootNode(): Promise<ValueDriverTree> {
      const type = this.TREE_TYPE;
      const rootNode = await this.queryBuilder()
                                     .select('id')
                                     .where('type = :type', { type })
                                     .andWhere('tree.parentId IS NULL')
                                     .getRawOne();
  
      if(rootNode) {
          return rootNode;
      } else {
          const { raw: [entity] } =  await this.queryBuilder()
          .insert()
          .into(ValueDriverTree)
          .values({ name: `${type.toUpperCase()} Value Driver`, type  })
          .returning(['name','description','tags','kpis'])
          .execute();
          return entity;
      }
    }

    async getFlattenedBranchByParent(params: FindOneOptions = {}): Promise<ValueDriverTree[]> {
      const parent = await this.findNode(params);
      const tree =  await this.treeRepository.findDescendantsTree(parent);

      return flattenTree(tree,'children');
    }

    public async findNode(params: FindOneOptions = {}) {
   
        const node = await this.treeRepository.findOne(params);
        
        if(!node) throw new NotFoundException(`Node of ${this.TREE_TYPE} type not found`);
        
        return node;
    }
    

    public queryBuilder(): QueryBuilder<ValueDriverTree> {
        return this.treeRepository.createQueryBuilder('tree');
     }

     public async updateNodeKpis(id: number,{ kpis }):Promise<any> {
        const node = await this.findNode({ where: { id }});
    
        const list = await this.kpisSrv.findManyKpisByIds(kpis)
    
              node.kpis = map(list,'id');
    
        return this.saveNode(node);
      }

    public async updateNodeTags(id: number,{ tags }):Promise<any> {
    
        const node = await this.findNode({ where: { id }});

        node.tags = await this.tagService.insertTagsIfNew(tags);

        return this.saveNode(node);
     }


     protected getRootNodeQuery(type: ValudDriverType) {
      return  this.queryBuilder()
        .select('tree.id','id')
        .addSelect('tree.parentId','parentId')
        .addSelect('tree.type','type')
        .addSelect('tree.tags','tags')
        .addSelect('tree.kpis','kpis')
        .addSelect('tree.industry_tree_id','industry_tree_id')
        .addSelect('tree.company_id','company_id')
        .addSelect('tree.name','name')
        .addSelect('tree.value_driver_lib_id','value_driver_lib_id')
        .where('tree.type = :type', { type })
        .andWhere('tree.parentId is NULL')
     }

     async removeNode(id) {
      const node = await this.findNode({ where: { id }})
  
      return await this.treeRepository.remove(node,{ });
    }

      public  async saveNode(node) {
        const { id } =  await this.treeRepository.save(node);
        return this.getNodeWithAgreggatedKpisAndTags(id);
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

     async moveNodeToRoot(nodeId) {
      const type = this.TREE_TYPE;

      const node =  await this.findNode({ where: { id: nodeId, type }});
  
            node.parent = await this.getTypeRootNode();
  
      return this.treeRepository.save(node);
    }

     async moveNode({ nodeId, parentId }) {
      const type = this.TREE_TYPE;
      const [node, parent] = await Promise.all([ await this.findNode({ where: { id: nodeId, type }}),
                                                 await this.findNode({ where: { id: parentId, type }})]);
         node.parent = parent;
  
       return this.treeRepository.save(node);
    }

     async cloneBranchEntity({ name, kpis, tags, value_driver_lib_id }: ValueDriverTree,  parent: ValueDriverTree, optionalProps = {}) {
      return  await this.saveNode(new ValueDriverTree({name, type: this.TREE_TYPE, value_driver_lib_id, kpis, tags, parent, ...optionalProps }));
     }

}
