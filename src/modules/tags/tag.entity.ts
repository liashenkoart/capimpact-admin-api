import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { TAGS_COLUMN_NAME } from './tags.constants';

@ObjectType()
@Entity(TAGS_COLUMN_NAME)
export class Tag {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  
  value: string;
}
