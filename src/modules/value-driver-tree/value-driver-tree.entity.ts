
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    TreeChildren,
    TreeParent,
    JoinColumn,
    ManyToOne,
    Tree
  } from 'typeorm';
import { ObjectType } from 'type-graphql';
import { ValudDriverType } from './velue-driver-type.enum';
import { ValueDriverLib} from '../value_driver_lib/value_driver_lib.entity';
import { IndustryTree } from '../industry-tree/industry-tree.entity';

@ObjectType() 
@Entity('value_driver_tree')
@Tree('materialized-path')
  export class ValueDriverTree {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column({ default: ValudDriverType.MASTER })
    type: ValudDriverType;
  
    @Column({ default: 0 })
    hierarchy_id: number;
  
    @TreeChildren({ cascade: true })
    children: ValueDriverTree[];
 
    @TreeParent({ onDelete:'CASCADE'})
    parent: ValueDriverTree; 

    @Column({ nullable: true})
    parentId: number;

    @ManyToOne(() => ValueDriverLib, lib => lib.treeNodes)
    @JoinColumn({ name: 'value_driver_lib_id' })
    valueDriverLib: ValueDriverLib;

    @Column({ type: 'jsonb', default: []})
    public tags: number[];

    @Column({ type: 'jsonb', default: []})
    public kpis: number[];

    @Column({ nullable: true})
    value_driver_lib_id: number;

    @ManyToOne(
      type => IndustryTree,
      industryTree => industryTree.capability_trees,
      { cascade: true }
    )
    @JoinColumn({ name: 'industry_tree_id' })
    industry_tree?: IndustryTree;

    @Column({ nullable: true})
    industry_tree_id: number;
   
    constructor(partial: Partial<ValueDriverTree>) {
      Object.assign(this, partial);
    }
  }
  