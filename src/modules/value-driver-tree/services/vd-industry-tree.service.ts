import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository, FindOneOptions } from 'typeorm';
import { ValudDriverType } from '../velue-driver-type.enum';
import { ValueDriverTree } from '../value-driver-tree.entity';
// Services 
import { KpiLibService } from '../../kpi-lib/kpi-lib.service';
import { TagService } from '../../tags/tags.service';
import { IndustryTreeService } from '../../industry-tree/industry-tree.service';
import { VDMasterTreeService } from './vd-master-tree.service';
// Libs
import { VDTreeService } from './vd-tree.service';

import { IsNull, Not } from 'typeorm';
import { size } from 'lodash';

import { flattenTree, asyncForEach } from '@lib/sorting';


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

        const industry = await this.industryTreeSrv.findNode({ where: { id }})

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
                                       .andWhere('tree.parentId IS NULL', { id })
                                       .getRawOne();

        return rootNode ? rootNode : 
        await this.saveNode(new ValueDriverTree({name: industry.name, type: ValudDriverType.INDUSTRY, industry_tree_id: industry.id}));
     }
     
      async getVDIndustryTreeByIndustryId(id: number): Promise<ValueDriverTree> {
        const root = await this.getRootVDIndustryNode(id);
        return await this.treeRepository.findDescendantsTree(root);
      }


      async cloneMasterEntityToIndustry({ name, kpis, tags, value_driver_lib_id}: ValueDriverTree, industry_tree_id: number, parent: ValueDriverTree) {
        return  await this.saveNode(new ValueDriverTree({name, type: ValudDriverType.INDUSTRY, value_driver_lib_id, industry_tree_id, parent, kpis, tags}));
      }

      public async updateNodeTags(id: number,{ tags }):Promise<any> {
    
        const node = await this.findNode({ where: { id }});

        node.tags = await this.tagService.insertTagsIfNew(tags);

        return this.saveNode(node);
     }

     public async findIndustryNodeById(id: number) {
       return  await this.findNode({ where: { id, type: ValudDriverType.INDUSTRY }});
     }

     public async updateNodeName({ name },id: number):Promise<any> {
    
      const node = await this.findNode({ where: { id }});

      node.name = name;

      return this.saveNode(node);
   }

   async getFlattenedIndustryBranch(params: FindOneOptions = {}): Promise<ValueDriverTree[]> {

    const industryRoot = await this.findNode(params);

   const tree =  await this.treeRepository.findDescendantsTree(industryRoot);

   return flattenTree(tree, 'children')
  }

  async getIndustryBranch(params: FindOneOptions = {}): Promise<ValueDriverTree> {

    const industryRoot = await this.findNode(params);

    return  await this.treeRepository.findDescendantsTree(industryRoot);
  }

  async clonedCouple(industryId: number) {
       const { id, parentId } = await this.industryTreeSrv.findNode({ where: { id:industryId, parentId: Not(IsNull()) }, relations:['parent']})
       const [tree, parentTree] = await Promise.all([this.getVDIndustryTreeByIndustryId(id),
                                                     this.getVDIndustryTreeByIndustryId(parentId)]);
       return { tree, parentTree }

  }

  async cloneIndustry({ industryId }, client): Promise<any> {

    const industry = await this.industryTreeSrv.findNode({ where: { id:industryId, parentId: Not(IsNull()) }, relations:['parent']});

    const [node,parentBranch] = await Promise.all([await this.findNode({ where: { industry_tree_id: industry.id, parentId: IsNull() }}),
                                                   await this.getFlattenedIndustryBranch({ where: { industry_tree_id: industry.parent.id, parentId: IsNull()}})]);


     await this.removeNode(node.id);

     const newNode = await this.getRootVDIndustryNode(industryId);

     const [topParentNode] = parentBranch;
     const check = { [`${topParentNode.id}`]: newNode };

     parentBranch.shift();
     
     await asyncForEach(parentBranch, async (node: ValueDriverTree, index: number) => {

           const parent =  check[node.parentId];
           const savedNode  = await this.cloneMasterEntityToIndustry(node,parent.industry_tree_id, parent);

           const progress = Math.round(100 / size(parentBranch) *  (index + 1));
           client.emit('cloningStatus', progress);
           check[node.id] = savedNode;  
     })

     return this.treeRepository.findDescendantsTree(newNode)
  }

      async cloneMasterToIndustry({ masterNodeId, industryNodeId }): Promise<ValueDriverTree> {

        const industryNode: ValueDriverTree = await this.findNode({ where: { id: industryNodeId, type: ValudDriverType.INDUSTRY }});
        const flattenedMasterBranch: ValueDriverTree[] = await this.masterTreeSrv.getFlattenedMasterBranchByParent({ where: { id: masterNodeId, type: ValudDriverType.MASTER } } );

        const [topMasterNode] = flattenedMasterBranch;

        const check = { [`${topMasterNode.parentId}`]: industryNode };

        const savedNodes = [];

        await asyncForEach(flattenedMasterBranch, async (node: ValueDriverTree) => {

          const parent =  check[node.parentId];

          const savedNode = await this.cloneMasterEntityToIndustry(node,industryNode.industry_tree_id, parent);
                check[node.id] = savedNode;   
                savedNodes.push(savedNode)
          })
   
       return this.treeRepository.findDescendantsTree(savedNodes[0])
      }

}
