import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import { KpiLib } from './kpi-lib.entity';

@ObjectType()
@Entity('capability_lib')
export class CapabilityLib {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @ManyToMany(type => KpiLib, kpiLib => kpiLib.capabilityLibs)
  kpiLibs: KpiLib[];

  constructor(partial: Partial<CapabilityLib>) {
    Object.assign(this, partial);
  }
}
