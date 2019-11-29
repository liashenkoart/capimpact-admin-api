import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Tree,
  TreeChildren,
  TreeParent,
  BeforeUpdate,
} from 'typeorm';

import { User } from '@modules/users/user.entity';

import { Industry } from '@modules/caps/entities/industry.entity';

@Entity('processes')
@Tree('materialized-path')
export class Process {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  pcf_id?: string;

  @Column({
    nullable: true,
  })
  hierarchy_id?: string;

  @Column({
    nullable: true,
  })
  difference_idx?: string;

  @Column({
    nullable: true,
  })
  change_details?: string;

  @Column({
    default: false,
  })
  metrics_avail?: boolean;

  @Column({
    nullable: true,
  })
  user_id?: number;

  @Column({
    nullable: true,
  })
  industry_id?: number;

  @Column({
    nullable: true,
  })
  parentId?: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  last_update: Date;

  @ManyToOne(
    type => User,
    user => user.processes
  )
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(
    type => Industry,
    industry => industry.processes
  )
  @JoinColumn({ name: 'industry_id' })
  industry?: Industry;

  @TreeChildren({
    cascade: true,
  })
  children: Process[];

  @TreeParent()
  parent?: Process;

  @BeforeUpdate()
  updateDates() {
    this.last_update = new Date();
  }

  constructor(partial: Partial<Process>) {
    Object.assign(this, partial);
  }
}
