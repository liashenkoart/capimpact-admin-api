import {
    Column,
  } from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('value_driver_lib')
export class ValueDriverLib {
  @Field(type => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  status: string;

  @Column()
  description: string;

  @Column({ type: 'jsonb' })
  public tags: any[];

  constructor(partial: Partial<ValueDriverLib>) {
    Object.assign(this, partial);
  }
}

