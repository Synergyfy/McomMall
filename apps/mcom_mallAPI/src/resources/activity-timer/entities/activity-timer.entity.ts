import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ActivityTimerType } from '../enums/activity-task-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('activity_timers')
export class ActivityTimer {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: ActivityTimerType, example: ActivityTimerType.GENERAL })
  @Column({
    type: 'enum',
    enum: ActivityTimerType,
    default: ActivityTimerType.GENERAL
  })
  type: ActivityTimerType;

  @ApiProperty({ example: 'Create Business' })
  @Column()
  title: string;

  @ApiProperty({ example: 'Create a new business listing', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: 'CREATE_BUSINESS' })
  @Column()
  key: string;

  @ApiProperty({ example: '/dashboard/business/create', nullable: true })
  @Column({ nullable: true })
  actionUrl: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'simple-array', nullable: true }) // Store tier IDs as comma-separated string
  targetTierIds: string[];

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  durationDays: number;

  @ApiProperty({ example: '2026-02-11T10:00:00Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2026-02-25T10:00:00Z', nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date; // For GENERAL tasks with fixed expiry.

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
