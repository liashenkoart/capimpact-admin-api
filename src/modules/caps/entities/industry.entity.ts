import { Entity, Column, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
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

  @Field()
  countProcesses: number;

  @Field()
  countCapabilities: number;

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
