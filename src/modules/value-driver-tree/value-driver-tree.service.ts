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
 
   const { children = []} = await this.treeRepository.findDescendantsTree(root);

   return children;
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
