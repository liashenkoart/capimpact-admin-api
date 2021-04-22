import {
    Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable,
  } from 'typeorm';
  import { ObjectType, Field, ID } from 'type-graphql';
  
  import { User } from '@modules/users/user.entity';
  import { Industry } from '../industry/industry.entity';
  import { Capability } from '../capability/capability.entity';
  import { Process } from '../process/process.entity';
  import { Challenge } from '../challenge/challenge.entity';
  import { GroupTag } from '../grouptag/group-tag.entity';
  import { GroupFilter } from '../groupfilter/groupfilter.entity';
  import { IndustryTree } from '../industry-tree/industry-tree.entity';
  import { CapabilityTree } from '../capability-tree/capability-tree.entity';
  import { COMPANY_COLUMN_NAME } from './company.constants';

  @ObjectType()
  @Entity(COMPANY_COLUMN_NAME)
  export class Company {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;
  
    @Field()
    @Column()
    name: string;

    @Column({ nullable: true })
    mnv_project_id : number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    cid?: string;
  
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
  
    @Field(() => User)
    @ManyToOne(
      type => User,
      user => user.companies
    )
    @JoinColumn({ name: 'user_id' })
    user?: User;
  
    @Field(() => Industry)
    @ManyToOne(
      type => IndustryTree,
      industryTree => industryTree.companies,
      { eager: true, nullable: true },
    )
    @JoinColumn({ name: 'industry_id'})
    industry: IndustryTree;
  
    @Field(() => [CapabilityTree], { nullable: true })
    @OneToMany(type => CapabilityTree, capabilityTree => capabilityTree.company, { cascade: true})
    capability_trees?: CapabilityTree[];
  
    @Field(() => [Capability], { nullable: true })
    @OneToMany(
      type => Capability,
      capability => capability.industry
    )
    capabilities?: Capability[];
  
    @Field(() => [Process], { nullable: true })
    @OneToMany(
      type => Process,
      process => process.industry
    )
    processes?: Process[];
  
    @Field(() => [Challenge], { nullable: true })
    @OneToMany(
      type => Challenge,
      challenge => challenge.company
    )
    challenges?: Challenge[];
  
    @Field(() => [GroupTag], { nullable: true })
    @OneToMany(
      type => GroupTag,
      grouptag => grouptag.company
    )
    grouptags?: GroupTag[];
  
    @Field(() => [GroupFilter], { nullable: true })
    @OneToMany(
      type => GroupFilter,
      groupfilter => groupfilter.company
    )
    groupfilters?: GroupFilter[];
    constructor(partial: Partial<Company>) {
      Object.assign(this, partial);
    }
  }
  