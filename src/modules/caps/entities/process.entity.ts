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
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import { User } from '@modules/users/user.entity';
import { Industry } from './industry.entity';
import { Company } from './company.entity';

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
    nullable: true,
  })
  user_id?: number;

  @Field(() => ID, { nullable: true })
  @Column({
    nullable: true,
  })
  industry_id?: number;

  @Field(() => ID, { nullable: true })
  @Column({
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
  last_update?: Date;

  @Field(() => User, { nullable: true })
  @ManyToOne(
    type => User,
    user => user.processes
  )
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Field(() => Industry, { nullable: true })
  @ManyToOne(
    type => Industry,
    industry => industry.processes,
    { cascade: true }
  )
  @JoinColumn({ name: 'industry_id' })
  industry?: Industry;

  @Field(() => Company, { nullable: true })
  @ManyToOne(
    type => Company,
    company => company.processes,
    { cascade: true }
  )
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Field(() => [Process], { nullable: true })
  @TreeChildren({
    cascade: true,
  })
  children?: Process[];

  @Field(() => Process, { nullable: true })
  @TreeParent()
  parent?: Process;

  @BeforeUpdate()
  updateDates() {
    this.last_update = new Date();
  }

  constructor(partial: Partial<Process>) {
    Object.assign(this, partial);
  }
}

// update tree set path = DESTINATION_PATH || subpath(path, nlevel(SOURCE_PATH)-1) where path <@ SOURCE_PATH;
