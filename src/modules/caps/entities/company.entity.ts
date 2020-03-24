import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import { User } from '@modules/users/user.entity';
import { Industry } from './industry.entity';
import { Capability } from './capability.entity';
import { Process } from './process.entity';
import { Challenge } from './challenge.entity';
import { GroupTag } from './group-tags.entity';
import { GroupFilter } from './group-filters.entity';

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
  user: User;

  @Field(() => Industry)
  @ManyToOne(
    type => Industry,
    industry => industry.companies,
    { eager: true }
  )
  @JoinColumn({ name: 'industry_id' })
  industry: Industry;

  @Field(() => [Capability], { nullable: true })
  @OneToMany(
    type => Capability,
    capability => capability.industry
  )
  capabilities?: Capability[];

  @Field(() => [Process], { nullable: true })
  @OneToMany(
    type => Process,
    proces => proces.industry
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
