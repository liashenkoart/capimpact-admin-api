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
  JoinTable,
} from 'typeorm';
import { ObjectType, Field, Float, ID } from 'type-graphql';

import { User } from '@modules/users/user.entity';
import { Industry } from './industry.entity';
import { Company } from './company.entity';
import { Classification } from './classification.entity';

@ObjectType()
@Entity('capabilities')
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

  @Field(() => Float, { nullable: true })
  @Column('decimal', {
    nullable: true,
  })
  readonly capitalCosts?: number;

  @Field(() => Float, { nullable: true })
  @Column('decimal', {
    nullable: true,
  })
  readonly fte?: number;

  @Field(() => Float, { nullable: true })
  @Column('decimal', {
    nullable: true,
  })
  readonly salaryCosts?: number;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  readonly tags?: { [key: string]: any };

  @Field(() => String, { nullable: true })
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  readonly filters?: { [key: string]: any };

  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  readonly kpis?: string[];

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
    type: 'timestamp',
    nullable: true,
  })
  last_update: Date;

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

  @BeforeUpdate()
  updateDates() {
    this.last_update = new Date();
  }

  constructor(partial: Partial<Capability>) {
    Object.assign(this, partial);
  }
}
