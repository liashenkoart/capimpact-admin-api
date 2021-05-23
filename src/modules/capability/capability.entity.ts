import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Tree,
    TreeChildren,
    TreeParent,
    BeforeUpdate,
    ManyToMany,
    OneToOne,
    JoinTable,
    RelationId
  } from 'typeorm';
  import { ObjectType, Field, Float, ID } from 'type-graphql';
  import { User } from '@modules/users/user.entity';
  import { Industry } from '../industry/industry.entity';
  import { Company } from '../company/company.entity';
  import { Startup } from '../startup/startup.entity';
  import { Classification } from '../classifications/classification.entity';
  import { CapabilityTree } from '../capability-tree/capability-tree.entity';
  import { CAPABILITY_COLUMN_NAME } from './capability.constants';


  @ObjectType()
  @Entity(CAPABILITY_COLUMN_NAME)
  @Tree('materialized-path')
  export class Capability {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;
  
    @Field()
    @Column()
    name: string;
  
    @Field(() => Boolean, { defaultValue: false })
    @Column('boolean', { default: false })
    default?: boolean;
  
    @Field(() => CapabilityTree,  { nullable: true })
    @OneToOne(type => CapabilityTree, capabilityTree => capabilityTree.capability, 
      { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'capability_tree'})
    capability_tree?: CapabilityTree;
  
    @RelationId((capability: Capability) => capability.capability_tree)
    capabilityTreeId: number;

    @Field(() => Float, { nullable: true })
    @Column('decimal', {
      nullable: true,
    })
    capitalCosts?: number;
  
    @Field(() => Float, { nullable: true })
    @Column('decimal', {
      nullable: true,
    })
    fte?: number;
  
    @Field(() => Float, { nullable: true })
    @Column('decimal', {
      nullable: true,
    })
    salaryCosts?: number;
  
    @Field(() => String, { nullable: true })
    @Column({
      type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb',
      nullable: true,
    })
     tags?: { [key: string]: any };
  
    @Field(() => String, { nullable: true })
    @Column({
      type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb',
      nullable: true,
    })
    filters?: { [key: string]: any };

    // @ManyToMany(type => Startup, startup => startup.capabilities)
    // startups: Startup[];

  
    @Field(() => String, { nullable: true })
    @Column({ type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb', nullable: true, default: [] })
    kpis?: string[];
  
    @Field({ nullable: true })
    @Column({
      nullable: true,
    })
    hierarchy_id?: string;
  
    @Field(() => ID, { nullable: true })
    @Column({
      name: 'user_id',
      nullable: true,
    })
    user_id?: number;
  
    @Field(() => ID, { nullable: true })
    @Column({
      name: 'industry_id',
      nullable: true,
    })
    industry_id?: number;
  
    @Field(() => ID, { nullable: true })
    @Column({
      name: 'company_id',
      nullable: true,
    })
    company_id?: number;
  
    @Field(() => ID, { nullable: true })
    @Column({
      nullable: true,
    })
    parentId?: number;
  
    @Field(() => Date, { nullable: true })
    @Column({
      type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp',
      nullable: true,
    })
    last_update?: Date;
  
    @Field(() => User, { nullable: true })
    @ManyToOne(
      type => User,
      user => user.capabilities
    )
    @JoinColumn({ name: 'user_id' })
    user?: User;
  
    @Field(() => Industry, { nullable: true })
    @ManyToOne(
      type => Industry,
      industry => industry.capabilities,
      { cascade: true }
    )
    @JoinColumn({ name: 'industry_id' })
    industry?: Industry;
  
    @Field(() => Company, { nullable: true })
    @ManyToOne(
      type => Company,
      company => company.capabilities,
      { cascade: true }
    )
    @JoinColumn({ name: 'company_id' })
    company?: Company;
  
    @Field(() => [Capability], { nullable: true })
    @TreeChildren({
      cascade: true,
    })
    children?: Capability[];
  
    @Field(() => Capability, { nullable: true })
    @TreeParent()
    parent?: Capability;
  
    @Field(() => [Classification], { nullable: true })
    @ManyToMany(type => Classification, {
      eager: true,
      cascade: true,
    })
    @JoinTable()
    classifications?: Classification[];
  
    @Field(() => ID, { nullable: true })
    @Column({
      name: 'original_id',
      nullable: true,
    })
    original_id?: number;
  
    @BeforeUpdate()
    updateDates?() {
      this.last_update = new Date();
    }
  
    constructor(partial: Partial<Capability>) {
      Object.assign(this, partial);
    }
  }
  