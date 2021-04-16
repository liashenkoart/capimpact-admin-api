import 'reflect-metadata';
import { Field, Int, ObjectType } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ONTOLOGY_COLUMN_NAME } from './ontology.constants';
import { OntoTree } from '../ontotree/ontotree.entity';

@ObjectType()
@Entity(ONTOLOGY_COLUMN_NAME)
export class Ontology {

  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @OneToMany(() => OntoTree, node => node.ontology)
  nodes: OntoTree[];

  // @Field(() => String, { nullable: true })
  // @Column({ type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb', nullable: true })
  // meta?: [];

  constructor(partial: Partial<Ontology>) {
    Object.assign(this, partial);
  }
}

