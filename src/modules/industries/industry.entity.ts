import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Process } from '@modules/processes/process.entity';
import { Capability } from '@modules/capabilities/capability.entity';

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

  constructor(partial: Partial<Industry>) {
    Object.assign(this, partial);
  }
}
