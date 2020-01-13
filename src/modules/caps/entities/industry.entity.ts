import { Entity, Column, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, ID, Int } from 'type-graphql';

import { Process } from './process.entity';
import { Capability } from './capability.entity';
import { Company } from './company.entity';

@ObjectType()
@Entity('industries')
export class Industry {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => Int, { nullable: true })
  countProcesses: number;

  @Field(() => Int, { nullable: true })
  countCapabilities: number;

  @Field(() => Int, { nullable: true })
  countCompanies: number;

  @Field(() => [Process], { nullable: true })
  @OneToMany(
    type => Process,
    proces => proces.industry
  )
  processes?: Process[];

  @Field(() => [Capability], { nullable: true })
  @OneToMany(
    type => Capability,
    capability => capability.industry
  )
  capabilities?: Capability[];

  @Field(() => [Company], { nullable: true })
  @OneToMany(
    type => Company,
    company => company.industry
  )
  companies?: Company[];

  constructor(partial: Partial<Industry>) {
    Object.assign(this, partial);
  }
}
