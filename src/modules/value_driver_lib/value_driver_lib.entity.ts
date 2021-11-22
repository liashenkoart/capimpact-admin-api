import {
    Column,
    OneToMany,
    OneToOne
  } from 'typeorm';
import {  ObjectType } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ValueDriverTree } from '../value-driver-tree/value-driver-tree.entity';

@ObjectType()
@Entity('value_driver_lib')
export class ValueDriverLib {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: false })
  status: boolean;

  @Column()
  description: string;

  @Column({ type: 'jsonb' })
  public tags: number[];

  constructor(partial: Partial<ValueDriverLib>) {
    Object.assign(this, partial);
  }
}

