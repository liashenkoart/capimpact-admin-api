import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from 'type-graphql';
import { IndustryTree } from '../industry-tree/industry-tree.entity';
import { Capability } from '../capability/capability.entity';
import { CapabilityTree } from '../capability-tree/capability-tree.entity';
import { STARTUP_COLUMN_NAME} from './startup.constants';

@ObjectType()
@Entity(STARTUP_COLUMN_NAME)
export class Startup {
  @Field(() => ID)
  @PrimaryColumn({
    type: 'text',
  })
  cid: string;

  @Field()
  @Column({
    type: 'text',
  })
  name: string;

  @Field(() => Date, { nullable: true })
  @Column({
    type: 'date',
    nullable: true,
  })
  first_financing_date?: Date;

  @Field(() => Float, { nullable: true })
  @Column({
    type: 'real',
    nullable: true,
  })
  first_financing_size?: number;

  @Field(() => Date, { nullable: true })
  @Column({
    type: 'date',
    nullable: true,
  })
  last_financing_date?: Date;

  @Field(() => Float, { nullable: true })
  @Column({
    type: 'real',
    nullable: true,
  })
  last_financing_size?: number;

  @Field(() => Float, { nullable: true })
  @Column({
    type: 'text',
    nullable: true,
  })
  revenue?: string;

  @Field(() => Int, { nullable: true })
  @Column({
    type: 'integer',
    nullable: true,
  })
  year_founded?: number;

  @Field({ nullable: true })
  @Column({
    type: 'text',
    nullable: true,
  })
  primary_industry_group?: string;

  @Field({ nullable: true })
  @Column({
    type: 'text',
    nullable: true,
  })
  primary_industry_code?: string;

  @Field({ nullable: true })
  @Column({
    type: 'text',
    nullable: true,
  })
  verticals?: string;

  // @Field(() => [Capability], { nullable: true })
  // @Column({
  //   type: 'jsonb', 
  //   nullable: true, 
  //   default:[] 
  // })
  // capabilities: {id: number, name: string1}[];

  // @ManyToMany(() => Capability)
  // @JoinTable(
  //   {
  //   name: "startup_capabilities_capabilities",
  //   joinColumns: [{ name: "cid" }],
  //   inverseJoinColumns: [{ name: "capabilitiesId" }]
  // }
  // )
  // capabilities: Capability[];

  @ManyToMany(() => CapabilityTree)
  @JoinTable(
    {
    name: "startup_capabilities",
    joinColumns: [{ name: "cid" }],
    inverseJoinColumns: [{ name: "capability_tree_id" }]
  })
  capabilities: CapabilityTree[];

  @Field({ nullable: true })
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Field(() => ID, { nullable: true })
  @Column({
    name: 'industry_id',
    nullable: true,
  })
  industry_tree_id?: number;

  @Field(() => ID, { nullable: true })
  @Column({
    name: 'company_id',
    nullable: true,
  })
  company_id?: number;

  @Field(() =>  IndustryTree, { nullable: true })
  @ManyToOne(
    () => IndustryTree,
    industry => industry.startups,
    { cascade: true }
  )
  @JoinColumn({ name: 'industry_id' })
  industry?: IndustryTree;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  hq_location?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  website?: string;

  @Field(() => Number, { nullable: true, defaultValue:[] })
  @Column({ type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb', nullable: true, default:[] })
  tags: number[];

  constructor(partial: Partial<Startup>) {
    Object.assign(this, partial);
  }
}

