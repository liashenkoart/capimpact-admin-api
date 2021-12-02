import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { ValudDriverType } from '../velue-driver-type.enum';
import { ValueDriverTree } from '../value-driver-tree.entity';
// Services 
import { KpiLibService } from '../../kpi-lib/kpi-lib.service';
import { TagService } from '../../tags/tags.service';
import { IndustryTreeService } from '../../industry-tree/industry-tree.service';
import { VDMasterTree } from './vd-master-tree.service';
// Libs
import { VDTree } from './vd-tree.service';


export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


@Injectable()
export class VDIndustryTree  extends VDTree{  
    constructor(
        protected tagService: TagService,
        protected kpisSrv: KpiLibService,
        @InjectRepository(ValueDriverTree) public readonly treeRepository: TreeRepository<ValueDriverTree>,
        private industryTreeSrv: IndustryTreeService,
        private masterTreeSrv: VDMasterTree
    ) {
        super(tagService,kpisSrv,treeRepository);
     }

     async getRootVDIndustryNode(id: number): Promise<ValueDriverTree> {

        const industry = await this.industryTreeSrv.test(id)

        const rootNode = await this.queryBuilder()
                                       .select('tree.id','id')
                                       .addSelect('tree.parentId','parentId')
                                       .addSelect('tree.type','type')
                                       .addSelect('tree.tags','tags')
                                       .addSelect('tree.kpis','kpis')
                                       .addSelect('tree.industry_tree_id','industry_tree_id')
                                       .addSelect('tree.name','name')
                                       .addSelect('tree.value_driver_lib_id','value_driver_lib_id')
                                       .where('tree.type = :type', { type: ValudDriverType.INDUSTRY})
                                       .andWhere('tree.industry_tree_id = :id', { id })
                                       .andWhere('tree.parentId IS NULL')
                                       .getRawOne();

    
        if(rootNode) {
            return rootNode;
        } else {
            const { raw: [entity] } =  await this.queryBuilder()
            .insert()
            .into(ValueDriverTree)
            .values({ name: industry.name, type: ValudDriverType.INDUSTRY, industry_tree_id: industry.id })
            .returning(['name','description','tags','kpis'])
            .execute();
            return entity;
        }
      }
     

      async getVDIndustryTreeByIndustryId(id: number) {
        const root = await this.getRootVDIndustryNode(id);
        return await this.treeRepository.findDescendantsTree(root);
      }


      async cloneMasterEntityToIndustry({ name, kpis, tags }: ValueDriverTree, industry_tree_id: number, parentId: number) {
      //  return  await this.queryBuilder()
      //   .insert()
      //   .into(ValueDriverTree)
      //   .values({ name, industry_tree_id, parentId, kpis, tags, type: ValudDriverType.INDUSTRY })
      //   .returning(['id','name','type','description','industry_tree_id','tags','kpis'])
      //   .execute();
        return  await this.treeRepository.save(new ValueDriverTree({name, type: ValudDriverType.INDUSTRY, industry_tree_id, parentId, kpis, tags}));
      }


      async cloneMasterToIndustry({ masterNodeId, industryNodeId }) {

        const industryNode: ValueDriverTree = await this.findNode({ where: { id: 410, type: ValudDriverType.INDUSTRY }});
        const flattenedMasterBranch: ValueDriverTree[] = await this.masterTreeSrv.getMasterBranchByParent({ where: { id: 350, type: ValudDriverType.MASTER } } );

        const [topMasterNode] = flattenedMasterBranch;

        const check = { [`${topMasterNode.parentId}`]: industryNode.id} ;

        await asyncForEach(flattenedMasterBranch, async (node: ValueDriverTree) => {

          const parentId =  check[node.parentId];
          const industry_tree_id = industryNode.id;

          const { id } = await this.cloneMasterEntityToIndustry(node,industry_tree_id, parentId);
                check[node.id] = id;   

          })

        return flattenedMasterBranch;

      }

}
