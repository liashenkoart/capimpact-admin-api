import { Entity, Column, OneToOne, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, ID, Int } from 'type-graphql';

import { Lense } from './lense.entity';

@ObjectType()
@Entity('classifications')
export class Classification {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => ID, { nullable: true })
  @Column()
  lense_id: number;

  @ManyToOne(type => Lense, lense => lense.classifications, {
    eager: true,
  })
  @JoinColumn({ name: 'lense_id' })
  lense: Lense;

  constructor(partial: Partial<Classification>) {
    Object.assign(this, partial);
  }
}
