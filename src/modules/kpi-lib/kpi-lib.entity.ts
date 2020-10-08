import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    Unique,
    ManyToOne,
    JoinColumn,
    ManyToMany,
    JoinTable
  } from 'typeorm';
  import { ObjectType, Field, ID } from 'type-graphql';
  
  import { Benchmark } from '../benchmark/benchmark.entity';
  import { KpiBenchmark } from '../kpi-benchmark/kpi-benchmark.entity';
  import { Process } from '../process/process.entity';
  import { CapabilityLib } from '../capability-libs/capability-lib.entity';
  
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
  
    @Field(() => Number, { nullable: true, defaultValue:[] })
    @Column({ type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb', nullable: true, default:[] })
    tags: number[];
  
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
  
    @Field(() => Process, { nullable: true })
    @ManyToOne(
      type => Process,
      process => process.kpi_libs,
      { cascade: true }
    )
    @JoinColumn({ name: 'process_id' })
    process?: Process;
  
    
    constructor(partial: Partial<KpiLib>) {
      Object.assign(this, partial);
    }
  }
  