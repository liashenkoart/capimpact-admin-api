import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { TECHNOLOGY_COLUMN_NAME } from './technology.constants'

@ObjectType()
@Entity(TECHNOLOGY_COLUMN_NAME)
export class Technology {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  value: string;
}
