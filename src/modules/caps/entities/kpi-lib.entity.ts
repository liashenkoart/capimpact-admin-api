import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

export enum KpiLibStatus {
  Revenue = 'Revenue',
  CostSaving = 'Cost Saving',
  Productivity = 'Productivity',
}

@ObjectType()
@Entity('kpi_libs')
export class KpiLib {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  label?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  kpi?: string;

  @Field(() => [String], { nullable: true })
  @Column({ array: true, type: 'varchar', nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  source?: string;

  @Field({ nullable: true })
  @Column({ type: 'enum', enum: KpiLibStatus, default: KpiLibStatus.Revenue })
  status?: KpiLibStatus;

  @Field({ nullable: true })
  @Column({ name: 'is_active', nullable: true })
  isActive?: boolean;

  constructor(partial: Partial<KpiLib>) {
    Object.assign(this, partial);
  }
}
