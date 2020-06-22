import { Entity, Column, PrimaryGeneratedColumn, TreeChildren, TreeParent, Tree, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import { CapabilityTree } from '@modules/caps/entities';

@ObjectType()
@Entity('industry_tree')
@Tree('materialized-path')
export class IndustryTree {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  naicsCode?: number;

  @Field(() => [CapabilityTree], { nullable: true })
  @OneToMany(
    type => CapabilityTree,
    capabilityTree => capabilityTree.industryTree
  )
  capabilityTrees?: CapabilityTree[];

  @Field(() => [IndustryTree], { nullable: true })
  @TreeChildren({ cascade: true })
  children?: IndustryTree[];

  @Field(() => IndustryTree, { nullable: true })
  @TreeParent()
  parent?: IndustryTree;

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  parentId?: number;

  @Field(() => [String], { nullable: true })
  @Column({ array: true, type: 'varchar', nullable: true })
  examples?: string[];

  constructor(partial: Partial<IndustryTree>) {
    Object.assign(this, partial);
  }
}
