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
import { Industry } from '@modules/industries/industry.entity';

import { User } from '@modules/users/user.entity';

@Entity('capabilities')
@Tree('materialized-path')
export class Capability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  hierarchy_id?: string;

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
    user => user.capabilities
  )
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(
    type => Industry,
    industry => industry.capabilities
  )
  @JoinColumn({ name: 'industry_id' })
  industry?: Industry;

  @TreeChildren({
    cascade: true,
  })
  children: Capability[];

  @TreeParent()
  parent?: Capability;

  @BeforeUpdate()
  updateDates() {
    this.last_update = new Date();
  }

  constructor(partial: Partial<Capability>) {
    Object.assign(this, partial);
  }
}
