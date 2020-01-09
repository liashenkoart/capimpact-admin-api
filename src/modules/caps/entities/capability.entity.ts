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
import { ObjectType, Field, Int, Float } from 'type-graphql';

import { User } from '@modules/users/user.entity';
import { Industry, Company } from '@modules/caps/entities';

@ObjectType()
@Entity('capabilities')
@Tree('materialized-path')
export class Capability {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

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

  @Field({ nullable: true })
  @Column({
    nullable: true,
  })
  hierarchy_id?: string;

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
  company_id?: number;

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
  children: Capability[];

  @Field(() => Capability, { nullable: true })
  @TreeParent()
  parent?: Capability;

  @BeforeUpdate()
  updateDates() {
    this.last_update = new Date();
  }

  constructor(partial: Partial<Capability>) {
    Object.assign(this, partial);
  }
}
