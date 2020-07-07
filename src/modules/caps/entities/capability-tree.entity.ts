import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  TreeChildren,
  TreeParent,
  Tree,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { IndustryTree } from '@modules/caps/entities/industry-tree.entity';
import { CapabilityLib } from '@modules/caps/entities/capability-lib.entity';
import { Capability } from '@modules/caps/entities/capability.entity';

@ObjectType()
@Entity('capability_tree')
@Tree('materialized-path')
export class CapabilityTree {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => Capability)
  @OneToOne(type => Capability, capability => capability.capability_tree)
  capability: Capability;

  @Field(() => ID, { nullable: true })
  @Column({ name: 'capability_lib_id', nullable: true })
  capability_lib_id?: number;

  @Field(() => CapabilityLib, { nullable: true })
  @ManyToOne(
    type => CapabilityLib,
    capabilityLib => capabilityLib.capability_trees,
    { cascade: true }
  )
  @JoinColumn({ name: 'capability_lib_id' })
  capability_lib: CapabilityLib;

  @Field(() => ID, { nullable: true })
  @Column({ name: 'industry_tree_id', nullable: true })
  industry_tree_id?: number;

  @Field(() => IndustryTree, { nullable: true })
  @ManyToOne(
    type => IndustryTree,
    industryTree => industryTree.capability_trees,
    { cascade: true }
  )
  @JoinColumn({ name: 'industry_tree_id' })
  industry_tree?: IndustryTree;

  @Field(() => [CapabilityTree], { nullable: true })
  @TreeChildren({ cascade: true })
  children?: CapabilityTree[];

  @Field(() => CapabilityTree, { nullable: true })
  @TreeParent()
  parent?: CapabilityTree;

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  parentId?: number;

  constructor(partial: Partial<CapabilityTree>) {
    Object.assign(this, partial);
  }
}
