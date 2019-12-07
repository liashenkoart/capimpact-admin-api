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
import { ObjectType, Field, Int } from 'type-graphql';

import { User } from '@modules/users/user.entity';

import { Industry } from '@modules/caps/entities/industry.entity';

@ObjectType()
@Entity('processes')
@Tree('materialized-path')
export class Process {
  @Field(() => Int)
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

  @Field(() => Int, { nullable: true })
  @Column({
    nullable: true,
  })
  user_id?: number;

  @Field(() => Int, { nullable: true })
  @Column({
    nullable: true,
  })
  industry_id?: number;

  @Field(() => Int, { nullable: true })
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

  @Field(() => User)
  @ManyToOne(
    type => User,
    user => user.processes
  )
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Field(() => Industry)
  @ManyToOne(
    type => Industry,
    industry => industry.processes,
    { cascade: true }
  )
  @JoinColumn({ name: 'industry_id' })
  industry?: Industry;

  @Field(() => [Process], { nullable: true })
  @TreeChildren({
    cascade: true,
  })
  children: Process[];

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
