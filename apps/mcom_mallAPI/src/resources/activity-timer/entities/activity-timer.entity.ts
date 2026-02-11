import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ActivityTimerTemplate } from './activity-timer-template.entity';
import { ActivityTimerType } from '../enums/activity-task-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('activity_timers')
export class ActivityTimer {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ type: () => ActivityTimerTemplate })
  @ManyToOne(() => ActivityTimerTemplate)
  @JoinColumn({ name: 'templateId' })
  template: ActivityTimerTemplate;

  @ApiProperty({ enum: ActivityTimerType, example: ActivityTimerType.GENERAL })
  @Column({
    type: 'enum',
    enum: ActivityTimerType,
    default: ActivityTimerType.GENERAL
  })
  type: ActivityTimerType;

  @ApiProperty({ example: '2026-02-11T10:00:00Z' })
  @Column({ type: 'timestamp' })
  startedAt: Date;

  @ApiProperty({ example: '2026-02-25T10:00:00Z' })
  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @ApiProperty({ example: '2026-02-15T10:00:00Z', nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @ApiProperty({ example: { CREATE_BUSINESS: true, IMPORT_CONTACTS: false } })
  @Column({ type: 'jsonb', default: {} })
  taskStatus: Record<string, boolean>;

  @ApiProperty({ example: { CREATE_BUSINESS: '2026-02-18T10:00:00Z' } })
  @Column({ type: 'jsonb', default: {} })
  taskExpirations: Record<string, Date>;

  @ApiProperty({ example: [{ pausedAt: '2026-02-12T10:00:00Z', resumedAt: '2026-02-12T11:00:00Z' }] })
  @Column({ type: 'jsonb', default: [] })
  pauses: { pausedAt: Date; resumedAt: Date | null }[];

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
