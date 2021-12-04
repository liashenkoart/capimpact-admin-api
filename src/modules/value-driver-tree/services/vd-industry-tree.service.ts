import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { ValudDriverType } from '../velue-driver-type.enum';
import { ValueDriverTree } from '../value-driver-tree.entity';
// Services 
import { KpiLibService } from '../../kpi-lib/kpi-lib.service';
import { TagService } from '../../tags/tags.service';
import { IndustryTreeService } from '../../industry-tree/industry-tree.service';
import { VDMasterTreeService } from './vd-master-tree.service';
// Libs
import { VDTreeService } from './vd-tree.service';


export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


@Injectable()
export class VDIndustryTreeService  extends VDTreeService {  
    constructor(
        public tagService: TagService,
        public kpisSrv: KpiLibService,
        @InjectRepository(ValueDriverTree) public readonly treeRepository: TreeRepository<ValueDriverTree>,
        public industryTreeSrv: IndustryTreeService,
        public masterTreeSrv: VDMasterTreeService
    ) {
        super(tagService,kpisSrv,treeRepository);
     }

     

     async getIndustryRootNode(): Promise<ValueDriverTree> {
      const rootNode = await this.queryBuilder()
                                     .select('id')
                                     .where('type = :type', { type: ValudDriverType.INDUSTRY})
                                     .andWhere('tree.parentId IS NULL')
                                     .getRawOne();
  
      if(rootNode) {
          return rootNode;
      } else {
          const { raw: [entity] } =  await this.queryBuilder()
          .insert()
          .into(ValueDriverTree)
          .values({ name: 'Industry Value Driver', type: ValudDriverType.INDUSTRY })
          .returning(['name','description','tags','kpis'])
          .execute();
          return entity;
      }
    }

     async getRootVDIndustryNode(id: number): Promise<ValueDriverTree> {

      const root =  await this.getIndustryRootNode();


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
                                     
                                       .getRawOne();

    
        if(rootNode) {
            return rootNode;
        } else {
      
            return  await this.treeRepository.save(new ValueDriverTree({name: industry.name, type: ValudDriverType.INDUSTRY, industry_tree_id: industry.id, parent: root}));
        }
      }
     

      async getVDIndustryTreeByIndustryId(id: number) {
        const root = await this.getRootVDIndustryNode(id);
        return await this.treeRepository.findDescendantsTree(root);
      }


      async cloneMasterEntityToIndustry({ name, kpis, tags }: ValueDriverTree, industry_tree_id: number, parent: ValueDriverTree) {
        return  await this.treeRepository.save(new ValueDriverTree({name, type: ValudDriverType.INDUSTRY, industry_tree_id, parent, kpis, tags}));
      }

      public async updateNodeTags(id: number,{ tags }):Promise<any> {
    
        const node = await this.findNode({ where: { id }});

        node.tags = await this.tagService.insertTagsIfNew(tags);

        return this.saveNode(node);
     }

     public async updateNodeName({ name },id: number):Promise<any> {
    
      const node = await this.findNode({ where: { id }});

      node.name = name;

      return this.saveNode(node);
   }

      async cloneMasterToIndustry({ masterNodeId, industryNodeId }) {

        const industryNode: ValueDriverTree = await this.findNode({ where: { id: industryNodeId, type: ValudDriverType.INDUSTRY }});
        const flattenedMasterBranch: ValueDriverTree[] = await this.masterTreeSrv.getMasterBranchByParent({ where: { id: masterNodeId, type: ValudDriverType.MASTER } } );

        const [topMasterNode] = flattenedMasterBranch;

        const check = { [`${topMasterNode.parentId}`]: industryNode };

        const savedNodes = [];

        await asyncForEach(flattenedMasterBranch, async (node: ValueDriverTree) => {

          const parent =  check[node.parentId];
          const industry_tree_id = industryNode.id;

          const savedNode  = await this.cloneMasterEntityToIndustry(node,industry_tree_id, parent);

                check[node.id] = savedNode;   
                savedNodes.push(savedNode)

          })

   
       return this.treeRepository.findDescendantsTree(savedNodes[0])
      }

}
