import 'reflect-metadata';
import { Field, Int, ObjectType } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, Column, Tree, TreeChildren, TreeParent, ManyToOne} from 'typeorm';
import { ONTOTREE_COLUMN_NAME } from './ontotree.constants';
import { Ontology } from '../ontologies/ontology.entity';

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

  @Field(() => String, { nullable: true })
  @Column({ type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb', nullable: true })
  meta?: [];
    ontoTreeNode: { name: any; };

  constructor(partial?: Partial<OntoTree>) {
    Object.assign(this, partial);
  }
}
