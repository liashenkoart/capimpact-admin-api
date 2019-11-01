import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Process } from '@app/modules/processes/process.entity';

@Entity('industries')
export class Industry {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(type => Process, proces => proces.industry, {
    cascade: true,
  })
  processes: Process[];
}
