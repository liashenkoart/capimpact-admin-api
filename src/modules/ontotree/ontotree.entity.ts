import 'reflect-metadata';
import { Field, Int, ObjectType } from 'type-graphql';
import { Entity, RelationId, PrimaryGeneratedColumn, Column, Tree, TreeChildren, TreeParent, ManyToOne} from 'typeorm';
import { ONTOTREE_COLUMN_NAME } from './ontotree.constants';
import { Ontology } from '../ontologies/ontology.entity';

export interface MetaProperties {
  url: string;
}

@ObjectType()
@Tree("materialized-path")
@Entity(ONTOTREE_COLUMN_NAME)
export class OntoTree {

  @PrimaryGeneratedColumn()
  id: number;

  @TreeChildren()
  children: OntoTree[];

  @Field()
  @Column()
  name: string;

  @TreeParent()
  parent: OntoTree;

  @ManyToOne(() => Ontology, ontology => ontology.nodes)
  ontology: Ontology;

  //@RelationId((parent: OntoTree) => parent.parent)
  @Column({ nullable: true })
  parentId: number;

  @Column({ type: 'jsonb', default: {} })
  meta: MetaProperties;

  constructor(partial?: Partial<OntoTree>) {
    Object.assign(this, partial);
  }
}
