import 'reflect-metadata';
import { Field, Int, ObjectType } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, Column, Tree, TreeChildren, TreeParent,  OneToOne, JoinColumn } from 'typeorm';
import { ONTOTREE_COLUMN_NAME } from './ontotree.constants';
import { Ontology } from '../ontologies/ontology.entity';

@ObjectType()
@Tree("materialized-path")
@Entity(ONTOTREE_COLUMN_NAME)
export class OntoTree {
  @Field(type => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @TreeChildren()
  children: OntoTree[];

  @Field()
  @Column()
  name: string;

  @TreeParent()
  parent: OntoTree;

  @OneToOne(() => Ontology)
  @JoinColumn()
  ontology: Ontology;

  @Field(() => String, { nullable: true })
  @Column({ type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb', nullable: true })
  meta: [];

  constructor(partial: Partial<OntoTree>) {
    Object.assign(this, partial);
  }
}
