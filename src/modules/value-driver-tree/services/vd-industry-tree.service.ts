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
export class VDIndustryTreeService extends VDTreeService {  

  protected TREE_TYPE = ValudDriverType.INDUSTRY;

    constructor(
        public tagService: TagService,
        public kpisSrv: KpiLibService,
        @InjectRepository(ValueDriverTree) public readonly treeRepository: TreeRepository<ValueDriverTree>,
        public industryTreeSrv: IndustryTreeService,
        public masterTreeSrv: VDMasterTreeService
    ) {
        super(tagService,kpisSrv,treeRepository);
     }

     async getRootVDIndustryNode(id: number): Promise<ValueDriverTree> {

        const industry = await this.industryTreeSrv.findNode({ where: { id }});

        const rootNode = await this.getRootNodeQuery(this.TREE_TYPE)
                                                    .andWhere('tree.industry_tree_id = :id', { id })
                                                    .getRawOne();

        return rootNode ? rootNode : 
        await this.saveNode(new ValueDriverTree({name: industry.name, type: this.TREE_TYPE, industry_tree_id: industry.id}));
     }
     
      async getVDIndustryTreeByIndustryId(id: number): Promise<ValueDriverTree> {
        const root = await this.getRootVDIndustryNode(id);
        return await this.treeRepository.findDescendantsTree(root);
      }

     public async findIndustryNodeById(id: number) {
       return  await this.findNode({ where: { id, type: this.TREE_TYPE }});
     }

     public async updateNodeName({ name },id: number):Promise<any> {
    
      const node = await this.findNode({ where: { id }});

      node.name = name;

      return this.saveNode(node);
   }

   async getFlattenedIndustryBranch(params: FindOneOptions = {}): Promise<ValueDriverTree[]> {

    console.log(params,'params')
    const industryRoot = await this.findNode(params);

    const tree =  await this.treeRepository.findDescendantsTree(industryRoot);

    console.log(tree)

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

  async moverToIndustryRoot(nodeId) {
    const node =  await this.findNode({ where: { id: nodeId, type: ValudDriverType.INDUSTRY }});

          node.parent = await this.getTypeRootNode()

          return this.treeRepository.save(node);
  }

  async cloneIndustry({ industryId }, client): Promise<any> {

    const industry = await this.industryTreeSrv.findNode({ where: { id:industryId, parentId: Not(IsNull()) }, relations:['parent']});

    const [node,parentBranch] = await Promise.all([await this.findNode({ where: { industry_tree_id: industry.id, parentId: IsNull() }}),
                                                   await this.getFlattenedIndustryBranch({ where: { industry_tree_id: industry.parent.id, parentId: IsNull()}})]);

     await this.removeNode(node.id);

     const newNode = await this.getRootVDIndustryNode(industryId);
     const { industry_tree_id } = newNode;
     const [topParentNode] = parentBranch;
     const check = { [`${topParentNode.id}`]: newNode };

     parentBranch.shift();
     
     await asyncForEach(parentBranch, async (node: ValueDriverTree, index: number) => {

           const parent =  check[node.parentId];
           
           const savedNode  = await this.cloneBranchEntity(node, parent, { industry_tree_id } );

           const progress = Math.round(100 / size(parentBranch) *  (index + 1));
           client.emit('cloningStatus', progress);
           check[node.id] = savedNode;  
     })

     return this.treeRepository.findDescendantsTree(newNode)
  }

      async cloneMasterToIndustry({ masterNodeId, industryNodeId }): Promise<ValueDriverTree> {

        const industryNode: ValueDriverTree = await this.findNode({ where: { id: industryNodeId, type: ValudDriverType.INDUSTRY }});
        const flattenedClonedBranch: ValueDriverTree[] = await this.getFlattenedBranchByParent({ where: { id: masterNodeId, type: ValudDriverType.MASTER } } );

        const [topClonedNode] = flattenedClonedBranch;

        const cached = { [`${topClonedNode.parentId}`]: industryNode };

        const savedNodes = [];

        const { industry_tree_id } = industryNode;

        await asyncForEach(flattenedClonedBranch, async (node: ValueDriverTree) => {

          const parent =  cached[node.parentId];

          const savedNode = await this.cloneBranchEntity(node, parent, { industry_tree_id } );
                cached[node.id] = savedNode;   
                savedNodes.push(savedNode)
          })
   
          return this.treeRepository.findDescendantsTree(savedNodes[0])
      }

}
