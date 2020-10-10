import { Entity, Column, PrimaryGeneratedColumn, TreeChildren, TreeParent, Tree, OneToMany, ManyToMany } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Company } from '../company/company.entity';
import { CapabilityTree } from '../capability-tree/capability-tree.entity';
import { Startup } from '../startup/startup.entity';
import { ValueDriver } from '../value-driver/value-driver.entity';
import { Process } from '../process/process.entity';
import { Sic } from '../common/entities/sic.entity';

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

  @Field(() => [Company], { nullable: true })
  @OneToMany(
    type => Company,
    company => company.industry,
   {nullable : true} 
  )
  companies?: Company[];

  
  @Field(() => Startup, { nullable: true })
  @OneToMany(
    type => Startup,
    process => process.industry
  )
  startups?: Startup[];

  @Field(() => ValueDriver, { nullable: true })
  @OneToMany(
    type => ValueDriver,
    process => process.industry
  )
  valueDrivers?: ValueDriver[];

  @Field(() => Process, { nullable: true })
  @OneToMany(
    type => Process,
    process => process.industry
  )
  processes?: Process[];

  @Field(() => [IndustryTree], { nullable: true })
  @TreeChildren({ cascade: true })
  children?: IndustryTree[];

  @Field(() => IndustryTree, { nullable: true })
  @TreeParent()
  parent?: IndustryTree;

  @ManyToMany(type => Sic, sic => sic.industry_trees)
  sics: Sic[];

  constructor(partial: Partial<IndustryTree>) {
    Object.assign(this, partial);
  }
}
