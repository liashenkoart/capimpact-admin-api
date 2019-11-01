import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import passwordCrypt from '@lib/passwordCrypt';

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
    nullable: true
  })
  firstName: string;

  @Column({
    nullable: true
  })
  lastName: string;

  @BeforeInsert()
  hashPassword() {
    this.password = passwordCrypt.encrypt(this.password);
  }

  /*
  @ManyToMany(type => ArticleEntity)
  @JoinTable()
  favorites: ArticleEntity[];

  @OneToMany(type => ArticleEntity, article => article.author)
  articles: ArticleEntity[];
  */

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

/*
const hashed = passwordCrypt.encrypt('123456')
console.log(passwordCrypt.verify('123456', hashed))
*/
