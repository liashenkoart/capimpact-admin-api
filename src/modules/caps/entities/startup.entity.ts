import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from 'type-graphql';

import { Industry } from './industry.entity';
import { Capability } from './capability.entity';

@ObjectType()
@Entity('startup')
export class Startup {
  @Field(() => ID)
  @PrimaryColumn({
    type: 'text',
  })
  cid: string;

  @Field()
  @Column({
    type: 'text',
  })
  name: string;

  @Field(() => Date, { nullable: true })
  @Column({
    type: 'date',
    nullable: true,
  })
  first_financing_date?: Date;

  @Field(() => Float, { nullable: true })
  @Column({
    type: 'real',
    nullable: true,
  })
  first_financing_size?: number;

  @Field(() => Date, { nullable: true })
  @Column({
    type: 'date',
    nullable: true,
  })
  last_financing_date?: Date;

  @Field(() => Float, { nullable: true })
  @Column({
    type: 'real',
    nullable: true,
  })
  last_financing_size?: number;

  @Field(() => Float, { nullable: true })
  @Column({
    type: 'text',
    nullable: true,
  })
  revenue?: string;

  @Field(() => Int, { nullable: true })
  @Column({
    type: 'integer',
    nullable: true,
  })
  year_founded?: number;

  @Field({ nullable: true })
  @Column({
    type: 'text',
    nullable: true,
  })
  primary_industry_group?: string;

  @Field({ nullable: true })
  @Column({
    type: 'text',
    nullable: true,
  })
  primary_industry_code?: string;

  @Field({ nullable: true })
  @Column({
    type: 'text',
    nullable: true,
  })
  verticals?: string;

  @Field(() => [Capability], { nullable: true })
  @Column({
    type: 'simple-json',
    nullable: true,
  })
  capabilities?: Capability[];

  @Field({ nullable: true })
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

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

  @Field(() => Industry, { nullable: true })
  @ManyToOne(
    () => Industry,
    industry => industry.processes,
    { cascade: true }
  )
  @JoinColumn({ name: 'industry_id' })
  industry?: Industry;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  hq_location?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  website?: string;

  constructor(partial: Partial<Startup>) {
    Object.assign(this, partial);
  }
}

// update tree set path = DESTINATION_PATH || subpath(path, nlevel(SOURCE_PATH)-1) where path <@ SOURCE_PATH;
