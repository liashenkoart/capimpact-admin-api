import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Company } from '../company/company.entity';

@ObjectType()
@Entity('group_filters')
export class GroupFilter {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => [String], { nullable: true })
  @Column({ array: true, type: 'varchar', nullable: true })
  filters?: string[];

  @Field(() => ID)
  @Column({
    name: 'company_id',
  })
  companyId: number;

  @Field(() => ID, { nullable: true })
  @Column({
    name: 'parent_id',
    nullable: true,
  })
  parentId?: number;

  @Field(() => Company, { nullable: true })
  @ManyToOne(
    type => Company,
    company => company.groupfilters,
    { cascade: true }
  )
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  constructor(partial: Partial<GroupFilter>) {
    Object.assign(this, partial);
  }
}
