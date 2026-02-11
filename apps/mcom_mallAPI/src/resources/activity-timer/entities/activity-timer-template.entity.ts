import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ActivityTimerType } from '../enums/activity-task-type.enum';

@Entity('activity_timer_templates')
export class ActivityTimerTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ActivityTimerType,
    default: ActivityTimerType.GENERAL
  })
  type: ActivityTimerType;

  @Column({ type: 'int', default: 14 })
  durationDays: number;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'jsonb', nullable: true })
  includedTierIds: string[];

  @Column({ type: 'jsonb', nullable: true })
  excludedTierIds: string[];

  @Column({ default: false })
  isForAllTiers: boolean;

  @Column({ type: 'jsonb' })
  tasks: {
    key: string;
    title: string;
    description: string;
    url: string;
    durationDays?: number;
  }[];

  @Column({ default: false })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
