import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { OntoTree } from './ontotree.entity';
import { OntologyService } from '../ontologies/ontology.service';
import { ONTOLOGY_TREE_NODE_NOT_FOUND } from './ontotree.constants';

@Injectable()
export class OntoTreeService {
  constructor(
    @InjectRepository(OntoTree) private readonly ontoTreeRepository: TreeRepository<OntoTree>,
    private readonly ontologiesSrv: OntologyService) {}

  async tree() {
    const parent = await  this.ontoTreeRepository.findOne();
    const tree =  await this.ontoTreeRepository.findDescendantsTree(parent);
    return [tree];
  }

  async treeByOntologyId(id: number): Promise<[OntoTree]> {
    await this.ontologiesSrv.findOneById(id);
    const node = await  this.ontoTreeRepository.findOne({ where: { ontology: { id }} ,relations: ['ontology']});
    if(!node) throw new NotFoundException(ONTOLOGY_TREE_NODE_NOT_FOUND);
    const tree =  await this.ontoTreeRepository.findDescendantsTree(node);
    return [tree];
  }

   async fillDymmyData() {
    const a1 = await  this.ontoTreeRepository.findOne({ where: { name: 'a31'}});
    
    const a11 = new OntoTree();
    a11.name = "a51";
    a11.parent = a1;
    await this.ontoTreeRepository.save(a11);
    
    const a12 = new OntoTree();
    a12.name = "a52";
    a12.parent = a1;
    await this.ontoTreeRepository.save(a12);
    
    const a111 = new OntoTree();
    a111.name = "a511";
    a111.parent = a11;
    await this.ontoTreeRepository.save(a111);
    
    const a112 = new OntoTree();
    a112.name = "a512";
    a112.parent = a11;
  }
}