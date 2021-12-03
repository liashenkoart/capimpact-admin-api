import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryBuilder, TreeRepository } from 'typeorm';
import { ValueDriverTree } from '../value-driver-tree.entity';

// Services 
import { KpiLibService } from '../../kpi-lib/kpi-lib.service';
import { TagService } from '../../tags/tags.service';

// Libs
import { map } from 'lodash';


@Injectable()
export class VDTreeService {  
    constructor(
        public tagService: TagService,
        public kpisSrv: KpiLibService,
        @InjectRepository(ValueDriverTree) public treeRepository: TreeRepository<ValueDriverTree>
    ) { }

    public async findNode(params) {
        const node = await this.treeRepository.findOne(params);
       
        if(!node) throw new NotFoundException('Node not found');
        
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
}
