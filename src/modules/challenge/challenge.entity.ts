import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { User } from '@modules/users/user.entity';
import { Company } from '../company/company.entity';

@ObjectType()
@Entity('challenges')
export class Challenge {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Column('simple-json', { nullable: true })
  public issues?: any[];

  @Field(() => ID, { nullable: true })
  @Column({
    name: 'user_id',
    nullable: true,
  })
  userId?: number;

  @Field(() => ID, { nullable: true })
  @Column({
    name: 'company_id',
    nullable: true,
  })
  companyId?: number;

  @Field(() => User)
  @ManyToOne(
    type => User,
    user => user.companies
  )
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Field(() => Company)
  @ManyToOne(
    type => Company,
    company => company.challenges
  )
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  constructor(partial: Partial<Challenge>) {
    Object.assign(this, partial);
  }
}
