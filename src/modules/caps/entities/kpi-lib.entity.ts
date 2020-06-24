import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Unique, ManyToMany, JoinTable } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import { Benchmark } from './benchmark.entity';
import { KpiBenchmark } from './kpi-benchmark.entity';
import { CapabilityLib } from './capability-lib.entity';

export enum BenefitType {
  Revenue = 'Revenue',
  CostSaving = 'Cost Saving',
  Productivity = 'Productivity',
}

@ObjectType()
@Entity('kpi_libs')
@Unique(['label'])
export class KpiLib {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  label?: string;

  @Field({ nullable: true })
  @Column({ type: 'real', nullable: true })
  min?: number;

  @Field({ nullable: true })
  @Column({ type: 'real', nullable: true })
  max?: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb', nullable: true })
  kpi?: string;

  @Field(() => [String], { nullable: true })
  @Column({ array: true, type: 'varchar', nullable: true })
  tags?: string[];

  @Field(() => [String], { nullable: true })
  @Column({ array: true, type: 'varchar', nullable: true })
  types?: string[];

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  source?: string;

  @Field({ nullable: true })
  @Column({
    type: process.env.NODE_ENV === 'test' ? 'text' : 'enum',
    enum: BenefitType,
    default: BenefitType.Revenue,
    nullable: true
  })
  benefitType?: BenefitType;

  @Field({ nullable: true })
  @Column({ name: 'is_active', nullable: true })
  isActive?: boolean;

  @Field(() => [Benchmark], { nullable: true })
  @OneToMany(
    type => Benchmark,
    benchmark => benchmark.kpilib
  )
  benchmarks?: Benchmark[];

  @Field(() => [KpiBenchmark], { nullable: true })
  @OneToMany(
    type => KpiBenchmark,
    kpiBenchmark => kpiBenchmark.kpilib
  )
  kpiBenchmarks?: KpiBenchmark[];

  @ManyToMany(type => CapabilityLib, capabilityLib => capabilityLib.kpi_libs)
  @JoinTable({
    name: 'cap2kpi',
    joinColumn: { name: 'kpi_lib_id' },
    inverseJoinColumn: { name: 'capability_lib_id' }
  })
  capability_libs: CapabilityLib[];

  constructor(partial: Partial<KpiLib>) {
    Object.assign(this, partial);
  }
}
