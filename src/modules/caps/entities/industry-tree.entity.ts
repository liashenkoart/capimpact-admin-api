import { Entity, Column, PrimaryGeneratedColumn, TreeChildren, TreeParent, Tree, OneToMany, ManyToMany } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import { CapabilityTree, Company } from '@modules/caps/entities';

@ObjectType()
@Entity('industry_tree')
@Tree('materialized-path')
export class IndustryTree {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  code?: string;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Field(() => [String], { nullable: true })
  @Column({ array: true, type: 'varchar', nullable: true })
  examples?: string[];

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  parentId?: number;

  @Field(() => [CapabilityTree], { nullable: true })
  @OneToMany(
    type => CapabilityTree,
    capabilityTree => capabilityTree.industry_tree
  )
  capability_trees?: CapabilityTree[];

  @Field(() => [IndustryTree], { nullable: true })
  @TreeChildren({ cascade: true })
  children?: IndustryTree[];

  @Field(() => IndustryTree, { nullable: true })
  @TreeParent()
  parent?: IndustryTree;

  @ManyToMany(type => Company, company => company.industry_trees)
  companies: Company[];

  constructor(partial: Partial<IndustryTree>) {
    Object.assign(this, partial);
  }
}