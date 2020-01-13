import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { Industry } from '@modules/caps/entities';

@Entity('default_processes')
@Tree('materialized-path')
export class DefaultProcess {
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
  industry_id?: number;

  @Column({
    nullable: true,
  })
  parentId?: number;

  @ManyToOne(
    type => Industry,
    industry => industry.processes,
    { cascade: true }
  )
  @JoinColumn({ name: 'industry_id' })
  industry?: Industry;

  @TreeChildren()
  children: DefaultProcess[];

  @TreeParent()
  parent?: DefaultProcess;

  constructor(partial: Partial<DefaultProcess>) {
    Object.assign(this, partial);
  }
}
