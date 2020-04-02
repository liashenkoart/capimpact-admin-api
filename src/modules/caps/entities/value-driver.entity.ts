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
import { Industry } from './industry.entity';
import { Company } from './company.entity';

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
  @Column({ type: 'jsonb', nullable: true })
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

  @Field(() => [ValueDriver], { nullable: true })
  @TreeChildren({
    cascade: true,
  })
  children?: ValueDriver[];

  @Field(() => ValueDriver, { nullable: true })
  @TreeParent()
  parent?: ValueDriver;

  constructor(partial: Partial<ValueDriver>) {
    Object.assign(this, partial);
  }
}
