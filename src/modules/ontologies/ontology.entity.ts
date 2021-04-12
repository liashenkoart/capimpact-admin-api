import 'reflect-metadata';
import { Field, Int, ObjectType } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ONTOLOGY_COLUMN_NAME } from './ontology.constants';

@ObjectType()
@Entity(ONTOLOGY_COLUMN_NAME)
export class Ontology {
  @Field(type => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb', nullable: true })
  meta: [];

  constructor(partial: Partial<Ontology>) {
    Object.assign(this, partial);
  }
}
