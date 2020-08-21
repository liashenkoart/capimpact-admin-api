import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable,} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { IndustryTree } from './industry-tree.entity';
  
  
  
  @ObjectType()
  @Entity('company')
  export class NewCompany {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;
  
    @Field()
    @Column()
    name: string;
  
    @Field({ nullable: true })
    @Column({ nullable: true })
    cid?: string;


    @ManyToMany(type => IndustryTree, industryTree => industryTree.companies)
    @JoinTable({
      name: 'company2industry',
      joinColumn: { name: 'new_company_id' },
      inverseJoinColumn: { name: 'industry_tree_id' }
    })
    industry_trees: IndustryTree[];


    constructor(partial: Partial<NewCompany>) {
      Object.assign(this, partial);
    }
  }
  