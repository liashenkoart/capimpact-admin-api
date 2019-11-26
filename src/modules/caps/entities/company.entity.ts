import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  BeforeUpdate,
} from 'typeorm';

import { User } from '@modules/users/user.entity';
import { Industry } from '@modules/caps/entities/industry.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  user_id?: number;

  @Column({
    nullable: true,
  })
  industry_id?: number;

  @ManyToOne(
    type => User,
    user => user.companies
  )
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(
    type => Industry,
    industry => industry.companies
  )
  @JoinColumn({ name: 'industry_id' })
  industry?: Industry;

  constructor(partial: Partial<Company>) {
    Object.assign(this, partial);
  }
}
