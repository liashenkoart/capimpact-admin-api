import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { sortTreeByField, flattenTree, asyncForEach } from '@lib/sorting';
import { BaseService } from 'modules/common/services';
import { ValueDriverCreationInput, ValueDriverInput, ValueDriversArgs } from './dto';
import { TagService } from "../tags/tags.service";

import { Industry } from '../industry/industry.entity';
import { ValueDriver } from './value-driver.entity';
import { IndustryTree } from '../industry-tree/industry-tree.entity';

@Injectable()
export class ValueDriverService extends BaseService {
  constructor(
    @Inject(forwardRef(() => TagService))
    private readonly  tagService: TagService,
    @InjectRepository(IndustryTree) public readonly industryTreeRepository: Repository<IndustryTree>,
    @InjectRepository(ValueDriver) private readonly valueDriverRepository: Repository<ValueDriver>,
    @InjectRepository(ValueDriver) private readonly treeRepository: TreeRepository<ValueDriver>,
    @InjectRepository(Industry) private readonly industryRepository: Repository<Industry>,
  ) {
    super();
  }

  async tree(query: ValueDriversArgs): Promise<ValueDriver> {
    const { industryId } = query;

      let rootDriverTree = await this.valueDriverRepository.findOne({ industryId, parentId: null });

    if (!rootDriverTree) {
      const industryCap = await this.industryTreeRepository.findOne({ id: industryId }) 
      rootDriverTree = await this.valueDriverRepository.save({ name: industryCap.name, industryId: industryCap.id, parentId: null })
    
      if (!industryCap) {
        throw new NotFoundException(`driver value with industry_tree_id: ${industryId} was not found`);
      }
    }
  
    const tree = await this.treeRepository.findDescendantsTree(rootDriverTree);

    return sortTreeByField('name', tree);
  }

  async getTags(id) {
    const entity = await this.valueDriverRepository.findOne(id);
    const tags = await this.tagService.tagRepository.findByIds(entity.tags);
    return { id: 1, tags}
  }

  async updateTags(id,dto) {
    const entity = await this.valueDriverRepository.findOne(id);
    entity.tags = await this.tagService.addTagIfNew(dto.tags);
    return  await this.valueDriverRepository.save(new ValueDriver(entity));
  }

  async findAll(args: ValueDriversArgs): Promise<ValueDriver[]> {
    return await this.valueDriverRepository.find(this.getFindAllQuery(args));
  }

  async findAllPagination(args: ValueDriversArgs): Promise<[ValueDriver[], number]> {
    return await this.valueDriverRepository.findAndCount(this.getFindAllQuery(args));
  }

  async findOneById(id: number): Promise<ValueDriver> {
    return this.valueDriverRepository.findOne({ id });
  }

  async count(args: ValueDriversArgs) {
    const count = await this.valueDriverRepository.count({ where: args });
    return { total: count };
  }

  async create(data: ValueDriverCreationInput): Promise<ValueDriver> {
    const process = new ValueDriver(data);
    process.parent = await this.findOneById(data.parentId);
    await this.valueDriverRepository.save(process);

    return await this.findOneById(process.id);
  }

  async save(id: number, data: ValueDriverInput): Promise<ValueDriver> {
    let valueDriver = new ValueDriver({ ...data });
        valueDriver.id = id;

     if (valueDriver.parentId) {
       valueDriver.parent = await this.findOneById(valueDriver.parentId);
     }

     valueDriver = await this.valueDriverRepository.save(valueDriver);
     valueDriver = await this.valueDriverRepository.findOne({ id: valueDriver.id });
     if (valueDriver.parentId === null) {
        await this.industryRepository.save({ id: valueDriver.industryId, name: valueDriver.name });
     }
     return await this.findOneById(valueDriver.id);
  }

  async saveMany(data: ValueDriverInput[]) {
    await this.valueDriverRepository.save(data);
    return await this.valueDriverRepository.findByIds(data.map(kl => kl.id));
  }

  async cloneTreeFromIndustry(id: any, industry: Industry, context?: any): Promise<ValueDriver> {
    const { user } = context;
    const industryId = parseInt(id, 10); // cloned industry id
    let node = null;
    // save root industry node
    let root = await this.valueDriverRepository.save({
      name: industry.name,
      default: true,
      industry,
      parent: null,
      user,
    });
    let clonedRoot = await this.valueDriverRepository.findOne({ industryId, parentId: null });
    if (clonedRoot) {
      const descendantsTree = await this.treeRepository.findDescendantsTree(clonedRoot);
      const descendants = descendantsTree ? flattenTree(descendantsTree, 'children') : [];
      let groupByName = {};
      for (let descendant of descendants) {
        if (descendant.parentId) {
          const parentNode = descendants.find(it => it.id === descendant.parentId);
          const parent = (parentNode && groupByName[parentNode.id]) || root;
          node = await this.valueDriverRepository.save({
            name: descendant.name,
            default: true,
            industryId: industry.id,
            parent,
            user,
          });
          groupByName[descendant.id] = node;
        }
      }
    }
    return this.tree({ industryId: industry.id });
  }

  async remove(id: number) {
    const node =  await this.valueDriverRepository.findOne(id);
      if(!node) throw new NotFoundException('Not found exception');
      const list = await  this.treeRepository.findDescendants(node);
      await asyncForEach(list.reverse(), async (node) => {
            await this.treeRepository.remove(node)
      })
      return node;
  }

  async removeByIndustry(industryId: any) {
    return this.valueDriverRepository.delete({ industryId });
  }
}
