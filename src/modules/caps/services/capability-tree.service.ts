import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';

import { BaseService } from '@modules/common/services';
import { CapabilityTree } from '../entities';
import { CapabilityTreesArgs, CapabilityTreeCreationInput, CapabilityTreeInput } from '../dto';
// import {sortTreeByField} from "@lib/sorting";

@Injectable()
export class CapabilityTreeService extends BaseService {
  constructor(
    @InjectRepository(CapabilityTree) private readonly capabilityTreeRepository: Repository<CapabilityTree>,
    @InjectRepository(CapabilityTree) private readonly treeRepository: TreeRepository<CapabilityTree>
  ) {
    super();
  }

  async findAll(query: CapabilityTreesArgs): Promise<CapabilityTree[] | void> {
    return this.capabilityTreeRepository.find(this.getFindAllQuery(query));
  }

  async findOneById(id: number): Promise<CapabilityTree> {
    return this.capabilityTreeRepository.findOne({ id });
  }

  async create(data: CapabilityTreeCreationInput): Promise<CapabilityTree> {
    let capabilityTree = new CapabilityTree(data);
    if (capabilityTree.parentId) {
      capabilityTree.parent = await this.findOneById(capabilityTree.parentId);
    }
    return await this.capabilityTreeRepository.save(capabilityTree);
  }

  async save(id: number, data: CapabilityTreeInput): Promise<CapabilityTree> {
    let capabilityTree = new CapabilityTree(data);
    if (capabilityTree.parentId) {
      capabilityTree.parent = await this.findOneById(capabilityTree.parentId);
    }
    return this.capabilityTreeRepository.save(capabilityTree);
  }

  async remove(id: number) {
    const node = await this.capabilityTreeRepository.findOne({ id });
    if (node) {
      await this.capabilityTreeRepository.remove(node);
    }
    return { id };
  }

  async tree(query: CapabilityTreesArgs): Promise<CapabilityTree> {
    const root = await this.capabilityTreeRepository.findOne({ parentId: null });
    if (!root) {
      throw new NotFoundException();
    }
    // todo: handle sorting somehow without name
    return this.treeRepository.findDescendantsTree(root);
    // const tree = await this.treeRepository.findDescendantsTree(root);
    // return sortTreeByField('name', tree);
  }
}
