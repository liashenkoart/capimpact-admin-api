import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';

import { Process, Capability, Company } from '@modules/caps/entities';

@ObjectType()
@Entity('industries')
export class Industry {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => [Process])
  @OneToMany(
    type => Process,
    proces => proces.industry
  )
  processes: Process[];

  @Field(() => [Capability])
  @OneToMany(
    type => Capability,
    capability => capability.industry
  )
  capabilities: Capability[];

  @Field(() => [Company])
  @OneToMany(
    type => Company,
    company => company.industry
  )
  companies: Company[];

  constructor(partial: Partial<Industry>) {
    Object.assign(this, partial);
  }
}
