import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import passwordCrypt from '@lib/passwordCrypt';

import { Process } from '@modules/processes/process.entity';
import { Capability } from '@modules/capabilities/capability.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    nullable: true,
  })
  firstName: string;

  @Column({
    nullable: true,
  })
  lastName: string;

  @OneToMany(
    type => Process,
    proces => proces.user,
    {
      cascade: true,
    }
  )
  processes: Process[];

  @OneToMany(
    type => Capability,
    capability => capability.user,
    {
      cascade: true,
    }
  )
  capabilities: Capability[];

  @BeforeInsert()
  hashPassword() {
    this.password = passwordCrypt.encrypt(this.password);
  }

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

/*
const hashed = passwordCrypt.encrypt('123456')
console.log(passwordCrypt.verify('123456', hashed))
*/
