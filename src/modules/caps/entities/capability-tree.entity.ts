import { Entity, Column, PrimaryGeneratedColumn, TreeChildren, TreeParent, Tree, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import { CapabilityLib, IndustryTree } from '@modules/caps/entities';

@ObjectType()
@Entity('capability_tree')
@Tree('materialized-path')
export class CapabilityTree {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => ID, { nullable: true })
  @Column({ name: 'capability_lib_id', nullable: true })
  capability_lib_id?: number;

  @Field(() => CapabilityLib, { nullable: true })
  @ManyToOne(
    type => CapabilityLib,
    capabilityLib => capabilityLib.capabilityTrees,
    { cascade: true }
  )
  @JoinColumn({ name: 'capability_lib_id' })
  capabilityLib?: CapabilityLib;

  @Field(() => ID, { nullable: true })
  @Column({ name: 'industry_tree_id', nullable: true })
  industry_tree_id?: number;

  @Field(() => IndustryTree, { nullable: true })
  @ManyToOne(
    type => IndustryTree,
    industryTree => industryTree.capabilityTrees,
    { cascade: true }
  )
  @JoinColumn({ name: 'industry_tree_id' })
  industryTree?: IndustryTree;

  @Field(() => [CapabilityTree], { nullable: true })
  @TreeChildren({ cascade: true })
  children?: CapabilityTree[];

  @Field(() => CapabilityTree, { nullable: true })
  @TreeParent()
  parent?: CapabilityTree;

  constructor(partial: Partial<CapabilityTree>) {
    Object.assign(this, partial);
  }
}
