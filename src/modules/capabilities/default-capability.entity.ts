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
import { Industry } from '@modules/industries/industry.entity';

@Entity('default-capabilities')
@Tree('materialized-path')
export class DefaultCapability {
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
  parent_id?: number;

  @ManyToOne(type => Industry, industry => industry.capabilities)
  @JoinColumn({ name: 'industry_id' })
  industry?: Industry;

  @TreeChildren()
  children: DefaultCapability[];

  @TreeParent()
  parent?: DefaultCapability;

  constructor(partial: Partial<DefaultCapability>) {
    Object.assign(this, partial);
  }
}
