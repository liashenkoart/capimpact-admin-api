import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import { KpiLib } from '../kpi-lib/kpi-lib.entity';
import { CapabilityTree } from '../capability-tree/capability-tree.entity';

@ObjectType()
@Entity('capability_lib')
export class CapabilityLib {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;
 
  @Column('text', {default: 'active'})
  status: string;

  @Column('text', { nullable: true })
  description: string;

  @Field(() => [CapabilityTree], { nullable: true })
  @OneToMany(
    type => CapabilityTree,
    capabilityTree => capabilityTree.capability_lib
  )
  capability_trees?: CapabilityTree[];


  @ManyToMany(type => KpiLib, kpiLib => kpiLib.capability_libs)
  kpi_libs: KpiLib[];

  @Field(() => String, { nullable: true, defaultValue:[] })
  @Column({ type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb', nullable: true, default:[] })
  tags: string[];

  constructor(partial: Partial<CapabilityLib>) {
    Object.assign(this, partial);
  }
}
