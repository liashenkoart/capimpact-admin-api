import {
  Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable,
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import { User } from '@modules/users/user.entity';
import { Industry } from '@modules/caps/entities/industry.entity';
import { Capability } from '@modules/caps/entities/capability.entity';
import { Process } from '@modules/caps/entities/process.entity';
import { Challenge } from '@modules/caps/entities/challenge.entity';
import { GroupTag } from '@modules/caps/entities/group-tags.entity';
import { GroupFilter } from '@modules/caps/entities/group-filters.entity';
import { IndustryTree } from '@modules/caps/entities/industry-tree.entity';
import { CapabilityTree } from '@modules/caps/entities/capability-tree.entity';



@ObjectType()
@Entity('companies')
export class Company {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;


  @Field({ nullable: true })
  @Column({ nullable: true })
  cid?: string;

  // @Field(() => ID, { nullable: true })
  // @Column({
  //   name: 'user_id',
  //   nullable: true,
  // })
  // user_id?: number;

  // @Field(() => ID, { nullable: true })
  // @Column({
  //   name: 'industry_id',
  //   nullable: true,
  // })
  // industry_id?: number;

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
    { eager: true, cascade: true },
  )
  @JoinColumn({ name: 'industry_id' })
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
