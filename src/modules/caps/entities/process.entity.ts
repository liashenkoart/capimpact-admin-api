import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Tree,
  TreeChildren,
  TreeParent,
  OneToMany,
  BeforeUpdate,
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import { User } from '@modules/users/user.entity';
import { Company, KpiLib, IndustryTree } from '@modules/caps/entities';

@ObjectType()
@Entity('processes')
@Tree('materialized-path')
export class Process {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({
    nullable: true,
  })
  pcf_id?: string;

  @Field({ nullable: true })
  @Column({
    nullable: true,
  })
  hierarchy_id?: string;

  @Field({ nullable: true })
  @Column({
    nullable: true,
  })
  difference_idx?: string;

  @Field({ nullable: true })
  @Column({
    nullable: true,
  })
  change_details?: string;

  @Field(() => Boolean, { nullable: true })
  @Column({
    default: false,
  })
  metrics_avail?: boolean;

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
    user => user.processes
  )
  //@JoinColumn({ name: 'user_id' })
  user?: User;

  @Field(() => IndustryTree, { nullable: true })
  @ManyToOne(
    type => IndustryTree,
    industry => industry.processes,
    { cascade: true }
  )
 // @JoinColumn({ name: 'industry_id' })
  industry?: IndustryTree;

  @Field(() => Company, { nullable: true })
  @ManyToOne(
    type => Company,
    company => company.processes,
    { cascade: true }
  )
  //@JoinColumn({ name: 'company_id' })
  company?: Company;

  @Field(() => [Process], { nullable: true })
  @TreeChildren({
    cascade: true,
  })
  children?: Process[];

  @Field(() => Process, { nullable: true })
  @TreeParent()
  parent?: Process

  @Field(() => [KpiLib], { nullable: true })
  @OneToMany(
    type => KpiLib,
    kpiLib => kpiLib.process
  )
  kpi_libs?: KpiLib[];

  @Field(() => Number, { nullable: true, defaultValue:[] })
  @Column({ type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb', nullable: true, default:[] })
  tags: number[];

  @BeforeUpdate()
  updateDates?() {
    this.last_update = new Date();
  }

  constructor(partial: Partial<Process>) {
    Object.assign(this, partial);
  }
}

// update tree set path = DESTINATION_PATH || subpath(path, nlevel(SOURCE_PATH)-1) where path <@ SOURCE_PATH;
