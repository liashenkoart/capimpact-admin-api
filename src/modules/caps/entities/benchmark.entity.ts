import { Entity, Column, OneToOne, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, ID, Int } from 'type-graphql';

import { Industry } from './industry.entity';
import { KpiLib } from './kpi-lib.entity';

@ObjectType()
@Entity('benchmarks')
export class Benchmark {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ name: 'name', nullable: true })
  name: string;

  @Field({ nullable: true })
  @Column({ name: 'benchmark', type: 'real', nullable: true })
  benchmark?: number;

  @Field(() => ID, { nullable: true })
  @Column({
    name: 'industry_id',
    nullable: true,
  })
  industry_id?: number;

  @Field(() => ID, { nullable: true })
  @Column({
    name: 'kpilib_id',
    nullable: true,
  })
  kpilib_id?: number;

  @Field(() => Industry, { nullable: true })
  @ManyToOne(
    type => Industry,
    industry => industry.benchmarks,
    { cascade: true }
  )
  @JoinColumn({ name: 'industry_id' })
  industry?: Industry;

  @Field(() => KpiLib, { nullable: true })
  @ManyToOne(
    type => KpiLib,
    kpilib => kpilib.benchmarks,
    { cascade: true }
  )
  @JoinColumn({ name: 'kpilib_id' })
  kpilib?: KpiLib;

  /*
  @Field(() => ID, { nullable: true })
  @Column()
  lense_id: number;

  @ManyToOne(type => Lense, lense => lense.benchmarks, {
    eager: true,
  })
  @JoinColumn({ name: 'lense_id' })
  lense: Lense;
  */

  constructor(partial: Partial<Benchmark>) {
    Object.assign(this, partial);
  }
}
