import { Entity, Column, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, ID, Int } from 'type-graphql';

import { Classification } from '../classifications/classification.entity';
import { LENSES_COLUMN_NAME } from './lenses.constants';

@ObjectType()
@Entity(LENSES_COLUMN_NAME)
export class Lense {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => [Classification], { nullable: true })
  @OneToMany(
    type => Classification,
    classification => classification.lense
  )
  classifications?: Classification[];

  constructor(partial: Partial<Lense>) {
    Object.assign(this, partial);
  }
}
