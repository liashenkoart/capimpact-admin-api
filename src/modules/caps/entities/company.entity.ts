import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  BeforeUpdate,
} from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';

import { User } from '@modules/users/user.entity';
import { Industry } from '@modules/caps/entities/industry.entity';

@ObjectType()
@Entity('companies')
export class Company {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => Int, { nullable: true })
  @Column({
    nullable: true,
  })
  user_id?: number;

  @Field(() => Int, { nullable: true })
  @Column({
    nullable: true,
  })
  industry_id?: number;

  @Field(() => User)
  @ManyToOne(
    type => User,
    user => user.companies
  )
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Field(() => Industry)
  @ManyToOne(
    type => Industry,
    industry => industry.companies
  )
  @JoinColumn({ name: 'industry_id' })
  industry?: Industry;

  constructor(partial: Partial<Company>) {
    Object.assign(this, partial);
  }
}
