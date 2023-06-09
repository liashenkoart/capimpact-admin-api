
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
    RelationId,
    ManyToMany
  } from 'typeorm';
  import { ObjectType, Field, ID } from 'type-graphql';
  import { IndustryTree } from '../industry-tree/industry-tree.entity';
  import { Startup } from '../startup/startup.entity';
  import { CapabilityLib } from '../capability-libs/capability-lib.entity';
  import { Capability } from '../capability/capability.entity';
  import { Company } from '../company/company.entity';
  import  Location from "../common/interfaces/location.interface";
  import { CAPABILITY_TREE_COLUMN_NAME } from "./capability-tree.constants"

  @ObjectType()
  @Entity(CAPABILITY_TREE_COLUMN_NAME)
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
      { onDelete: 'CASCADE' , eager :true }
    )
    @JoinColumn({ name: 'capability' })
    capability: Capability;

    @RelationId((capabilityTree: CapabilityTree) => capabilityTree.capability)
    capabilityId: number;
  
    @Field(() => ID, { nullable: true })
    @Column({ name: 'capability_lib_id', nullable: true })
    capability_lib_id?: number;

    // @Column({ nullable: true })
    // prevParentId: number;

    // @Column({ nullable: true })
    // prevId: number;
  
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
  
    @Field(() => ID, { nullable: true })
    @Column({ name: 'company_id', nullable: true })
    company_id?: number;
  
    @Field(() => ID, { defaultValue: 0 })
    @Column({ name: 'hierarchy_id', default: 0})
    hierarchy_id?: number;
  
    @Field(() => Company, { nullable: true })
    @ManyToOne(type => Company, company => company.capability_trees)
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
  
    @Field(() => Number, { nullable: true, defaultValue:[] })
    @Column({ type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb', nullable: true, default:[1] })
    tags: number[];
  
    @Field(() => Object, {  defaultValue: { 
      address: "", 
      city: "",
      state: "",
      zipcode: 0,
      country: ""
    }})
    @Column({ type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb',default:{ 
      address: "", 
      city: "",
      state: "",
      zipcode: 0,
      country: ""
    }})
    location: Location;
  
    @Field(() => Number, { nullable: true, defaultValue:[] })
    @Column({ type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb', nullable: true, default:[] })
    technologies: number[];

    @ManyToMany(type => Startup, startup => startup.capabilities)
    startups: Startup[];

  
    constructor(partial: Partial<CapabilityTree>) {
      Object.assign(this, partial);
    }
  }
  