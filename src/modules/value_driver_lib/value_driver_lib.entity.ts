import 'reflect-metadata';
import { Field, Int, ObjectType } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('value_driver_lib')
export class ValueDriverLib {
  @Field(type => Int)
  @PrimaryGeneratedColumn()
  id: number;

  constructor(partial: Partial<ValueDriverLib>) {
    Object.assign(this, partial);
  }
}

