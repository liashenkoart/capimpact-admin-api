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
import { Company } from '@modules/caps/entities/company.entity';

@ObjectType()
@Entity('capability_tree')
@Tree('materialized-path')
export class CapabilityTree {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  cap_name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  type: string;
  
  @Field(() => Capability,  { nullable: true })
  @OneToOne(type => Capability, capability => capability.capability_tree, 
     { onDelete: 'CASCADE' }
  )
  capability: Capability;

  @Field(() => ID, { nullable: true })
  @Column({ name: 'capability_id', nullable: true })
  capability_lib_id?: number;

  @Field(() => CapabilityLib, { nullable: true })
  @ManyToOne(
    type => CapabilityLib,
    capabilityLib => capabilityLib.capability_trees,
    { cascade: true }
  )
  @JoinColumn({ name: 'capability_id' })
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

  @Field(() => ID, { nullable: true })
  @Column({ name: 'company_id', nullable: true })
  company_id?: number;

  @Field(() => Company, { nullable: true })
  @ManyToOne(type => Company, company => company.capability_trees, { cascade: true}
  )
  @JoinColumn({ name: 'company_id' })
  company?: Company;

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
