import 'reflect-metadata';
import { Field, Int, ObjectType } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import passwordCrypt from '@lib/passwordCrypt';

import { Process } from '../process/process.entity';
import { Capability } from '../capability/capability.entity';
import { Company } from '../company/company.entity';

@ObjectType()
@Entity('users')
export class User {
  @Field(type => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  email: string;

  @Exclude()
  @Column()
  password?: string;

  @Field({
    nullable: true,
  })
  @Column({
    nullable: true,
  })
  firstName?: string;

  @Field({
    nullable: true,
  })
  @Column({
    nullable: true,
  })
  lastName?: string;

  @OneToMany(
    type => Process,
    proces => proces.user,
    {
      cascade: true,
    }
  )
  processes?: Process[];

  @OneToMany(
    type => Capability,
    capability => capability.user,
    {
      cascade: true,
    }
  )
  capabilities?: Capability[];

  @OneToMany(
    type => Company,
    company => company.user,
    {
      cascade: true,
    }
  )
  companies?: Company[];

  @BeforeInsert()
  hashPassword?() {
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
