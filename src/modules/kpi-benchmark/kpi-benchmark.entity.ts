import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { ObjectType, Field, ID } from 'type-graphql';
  import { Industry } from '../industry/industry.entity';
  import { KpiLib } from '../kpi-lib/kpi-lib.entity';
  
  @ObjectType()
  @Entity('kpi_benchmarks')
  export class KpiBenchmark {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;
  
    @Field({ nullable: true })
    @Column({ type: 'text', nullable: true })
    benchmark?: number;
  
    @Field(() => ID, { nullable: true })
    @Column({
      name: 'kpilib_id',
    })
    kpilibId: number;
  
    @Field(() => ID, { nullable: true })
    @Column({
      name: 'industry_id',
    })
    industryId: number;
  
    @Field(() => Industry, { nullable: true })
    @ManyToOne(
      type => Industry,
      industry => industry.kpiBenchmarks,
      { cascade: true }
    )
    @JoinColumn({ name: 'industry_id' })
    industry?: Industry;
  
    @Field(() => KpiLib, { nullable: true })
    @ManyToOne(
      type => KpiLib,
      kpiLib => kpiLib.kpiBenchmarks,
      { cascade: true }
    )
    @JoinColumn({ name: 'kpilib_id' })
    kpilib?: KpiLib;
  
    constructor(partial: Partial<KpiBenchmark>) {
      Object.assign(this, partial);
    }
  }
  