import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository, In } from 'typeorm';
import { ValudDriverType } from '../velue-driver-type.enum';
import { ValueDriverTree } from '../value-driver-tree.entity';
// Services 
import { KpiLibService } from '../../kpi-lib/kpi-lib.service';
import { TagService } from '../../tags/tags.service';
import { CompanyService } from '../../company/services/company.service';

import { VDMasterTreeService } from './vd-master-tree.service';
// Libs
import { VDTreeService } from './vd-tree.service';

import { asyncForEach } from '@lib/sorting';

@Injectable()
export class VDCompanyTreeService  extends VDTreeService {  
    protected TREE_TYPE = ValudDriverType.COMPANY;
    constructor(
        @InjectRepository(ValueDriverTree) public readonly treeRepository: TreeRepository<ValueDriverTree>,
        public tagService: TagService,
        public kpisSrv: KpiLibService,
        public companySrv: CompanyService,
        public masterTreeSrv: VDMasterTreeService
    ) {
        super(tagService,kpisSrv,treeRepository);
     }

    async getVDCompanyTreeByCompanyId(id: number): Promise<ValueDriverTree> {
        const root = await this.getRootVDCompanyNode(id);
        return await this.treeRepository.findDescendantsTree(root);
    }

    async getRootVDCompanyNode(id: number): Promise<ValueDriverTree> {

        const company = await this.companySrv.findCompanyById({ where: { id }})

        const rootNode = await this.getRootNodeQuery(ValudDriverType.COMPANY)
        .andWhere('tree.company_id = :id', { id })
        .getRawOne()
        
        return rootNode ? rootNode : 
        await this.saveNode(new ValueDriverTree({name: company.name, type: ValudDriverType.COMPANY, company_id: company.id}));
     }

     async cloneMasterOrIndustryBranchToCompanyNode({ name, kpis, tags, value_driver_lib_id}: ValueDriverTree, company_id: number, parent: ValueDriverTree) {
        return  await this.saveNode(new ValueDriverTree({name, type: ValudDriverType.COMPANY, value_driver_lib_id, company_id, parent, kpis, tags}));
    }

     async clone({ industryOrMasterNodeId, companyNodeId }): Promise<ValueDriverTree> {

        const companyNode: ValueDriverTree = await this.findNode({ where: { id: companyNodeId, type: ValudDriverType.COMPANY }});
        const flattenedClonedBranch: ValueDriverTree[] = await this.getFlattenedBranchByParent({ where: { id: industryOrMasterNodeId, type: In([ValudDriverType.MASTER, ValudDriverType.INDUSTRY]) } } );

        const [topClonedNode] = flattenedClonedBranch;

        const cached = { [`${topClonedNode.parentId}`]: companyNode };

        const savedNodes = [];

        const { company_id } = companyNode;

        await asyncForEach(flattenedClonedBranch, async (node: ValueDriverTree) => {

          const parent =  cached[node.parentId];

          const savedNode = await this.cloneBranchEntity(node, parent, { company_id } );
                cached[node.id] = savedNode;   
                savedNodes.push(savedNode)
          })
   
       return this.getVDCompanyTreeByCompanyId(company_id)
      }

}
