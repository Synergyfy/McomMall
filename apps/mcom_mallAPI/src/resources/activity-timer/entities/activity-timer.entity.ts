import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ActivityTimerTemplate } from './activity-timer-template.entity';
import { ActivityTimerType } from '../enums/activity-task-type.enum';

@Entity('activity_timers')
export class ActivityTimer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => ActivityTimerTemplate)
  @JoinColumn({ name: 'templateId' })
  template: ActivityTimerTemplate;

  @Column({
    type: 'enum',
    enum: ActivityTimerType,
    default: ActivityTimerType.GENERAL
  })
  type: ActivityTimerType;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'jsonb', default: {} })
  taskStatus: Record<string, boolean>;

  @Column({ type: 'jsonb', default: [] })
  pauses: { pausedAt: Date; resumedAt: Date | null }[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
