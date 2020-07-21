import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { IndustryTree } from '@modules/caps/entities/industry-tree.entity';

@ObjectType()
@Entity('sic')
export class Sic {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  code?: string;

  @Column('text', { nullable: true })
  description: string;

  @ManyToMany(type => IndustryTree, industryTree => industryTree.sics)
  @JoinTable({
    name: 'naics2sic',
    joinColumn: { name: 'sic_id' },
    inverseJoinColumn: { name: 'industry_tree_id' }
  })
  industry_trees: IndustryTree[];

  constructor(partial: Partial<Sic>) {
    Object.assign(this, partial);
  }
}
