import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryBuilder, TreeRepository } from 'typeorm';
import { ValueDriverLibService } from '../value_driver_lib/value_driver_lib.service';
import { ValudDriverType } from './velue-driver-type.enum';
import { ValueDriverTree } from './value-driver-tree.entity';

@Injectable()
export class ValueDriverTreeService {  
    constructor(
       private valueDriverLib: ValueDriverLibService,
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
        .returning(['name','description','tags'])
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
 
   return this.treeRepository.findDescendantsTree(root);
  }

  async moveNode({ nodeId, parentId}) {
    const [node, parent] = await Promise.all([ await this.findNode({ where: { id: nodeId }}),
                                               await this.findNode({ where: { id: parentId}})]);
    
    node.parent = parent;

    return this.valueDriverTreeRepository.save(node);
  }

  async toggleNode({ value_driver_lib_id, type }) {
       const [lib,exist, parent] = await Promise.all([await this.valueDriverLib.findOneSimple(value_driver_lib_id),
                                                      await this.treeRepository.findOne({ value_driver_lib_id, type }), 
                                                      await this.getMasterRootNode()]);
       const { name, tags } = lib;

       if(!exist) {
          return await this.treeRepository.save(new ValueDriverTree({ name, tags, type, parent, value_driver_lib_id }))
       } else {
          return await this.treeRepository.remove(exist)
       }
  }
}
