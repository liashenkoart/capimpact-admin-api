import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Tree,
    TreeChildren,
    TreeParent,
  } from 'typeorm';
  import { ObjectType, Field, ID } from 'type-graphql';
  import { User } from '@modules/users/user.entity';
  import { Company } from '../company/company.entity';
  import { IndustryTree } from '../industry-tree/industry-tree.entity';
  
  @ObjectType()
  @Entity('value_drivers')
  @Tree('materialized-path')
  export class ValueDriver {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;
  
    @Field()
    @Column()
    name: string;
  
    @Field(() => String, { nullable: true })
    @Column({ type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb', nullable: true, default:[]})
    readonly kpis?: string[];
  
    @Field(() => ID, { nullable: true })
    @Column({
      name: 'user_id',
      nullable: true,
    })
    userId?: number;
  
    @Field(() => ID, { nullable: true })
    @Column({
      name: 'industry_id',
      nullable: true,
    })
    industryId?: number;
  
    @Field(() => ID, { nullable: true })
    @Column({
      name: 'company_id',
      nullable: true,
    })
    companyId?: number;
  
    @Field(() => ID, { nullable: true })
    @Column({
      nullable: true,
    })
    parentId?: number;
  
    @Field(() => User, { nullable: true })
    @ManyToOne(
      type => User,
      user => user.capabilities
    )
    @JoinColumn({ name: 'user_id' })
    user?: User;
  
    @Field(() => IndustryTree, { nullable: true })
    @ManyToOne(
      type => IndustryTree,
      industry => industry.valueDrivers,
      { cascade: true }
    )
    @JoinColumn({ name: 'industry_id' })
    industry?: IndustryTree;
  
    @Field(() => Company, { nullable: true })
    @ManyToOne(
      type => Company,
      company => company.capabilities,
      { cascade: true }
    )
    @JoinColumn({ name: 'company_id' })
    company?: Company;
  
    @Field(() => [ValueDriver], { nullable: true })
    @TreeChildren({
      cascade: true
    })
    children?: ValueDriver[];
  
    @Field(() => ValueDriver, { nullable: true })
    @TreeParent()
    parent?: ValueDriver;
  
    @Field(() => Number, { nullable: true, defaultValue:[] })
    @Column({ type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb', nullable: true, default:[] })
    tags: number[];
  
    constructor(partial: Partial<ValueDriver>) {
      Object.assign(this, partial);
    }
  }
  