import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import { Company } from './company.entity';

@ObjectType()
@Entity('group_tags')
export class GroupTag {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => [String], { nullable: true })
  @Column({ array: true, type: 'varchar', nullable: true })
  tags?: string[];

  @Field(() => ID)
  @Column({
    name: 'company_id',
  })
  companyId: number;

  @Field(() => Company, { nullable: true })
  @ManyToOne(
    type => Company,
    company => company.grouptags,
    { cascade: true }
  )
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  constructor(partial: Partial<GroupTag>) {
    Object.assign(this, partial);
  }
}
