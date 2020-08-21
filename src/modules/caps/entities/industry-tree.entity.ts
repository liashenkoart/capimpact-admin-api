import { Entity, Column, PrimaryGeneratedColumn, TreeChildren, TreeParent, Tree, OneToMany, ManyToMany } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Company } from '@modules/caps/entities/company.entity';
import { CapabilityTree } from '@modules/caps/entities/capability-tree.entity';
import { Sic } from '@modules/caps/entities/sic.entity';
import { NewCompany } from './new-company.entity';

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

  @ManyToMany(type => NewCompany, company => company.industry_trees)
  new_company: NewCompany[];

  @ManyToMany(type => Sic, sic => sic.industry_trees)
  sics: Sic[];

  constructor(partial: Partial<IndustryTree>) {
    Object.assign(this, partial);
  }
}
