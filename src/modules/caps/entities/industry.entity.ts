import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { Process, Capability, Company } from '@modules/caps/entities';

@Entity('industries')
export class Industry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(
    type => Process,
    proces => proces.industry,
    {
      cascade: true,
    }
  )
  processes: Process[];

  @OneToMany(
    type => Capability,
    capability => capability.industry,
    {
      cascade: true,
    }
  )
  capabilities: Capability[];

  @OneToMany(
    type => Company,
    company => company.industry,
    {
      cascade: true,
    }
  )
  companies: Company[];

  constructor(partial: Partial<Industry>) {
    Object.assign(this, partial);
  }
}
