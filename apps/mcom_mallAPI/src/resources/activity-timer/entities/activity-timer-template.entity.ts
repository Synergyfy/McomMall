import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ActivityTimerType } from '../enums/activity-task-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('activity_timer_templates')
export class ActivityTimerTemplate {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Onboarding Timer' })
  @Column()
  name: string;

  @ApiProperty({ example: 'Main onboarding flow for new businesses' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ enum: ActivityTimerType, example: ActivityTimerType.GENERAL })
  @Column({
    type: 'enum',
    enum: ActivityTimerType,
    default: ActivityTimerType.GENERAL
  })
  type: ActivityTimerType;

  @ApiProperty({ example: 14 })
  @Column({ type: 'int', default: 14 })
  durationDays: number;

  @ApiProperty({ example: '2026-02-11T10:00:00Z' })
  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @ApiProperty({ example: '2026-03-11T10:00:00Z' })
  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @ApiProperty({ example: ['tier-uuid-1'] })
  @Column({ type: 'jsonb', nullable: true })
  includedTierIds: string[];

  @ApiProperty({ example: [] })
  @Column({ type: 'jsonb', nullable: true })
  excludedTierIds: string[];

  @ApiProperty({ example: true })
  @Column({ default: false })
  isForAllTiers: boolean;

  @ApiProperty({
    example: [
      { key: 'CREATE_BUSINESS', title: 'Create Business', description: 'Setup your profile', url: '/dash', durationDays: 7 }
    ]
  })
  @Column({ type: 'jsonb' })
  tasks: {
    key: string;
    title: string;
    description: string;
    url: string;
    durationDays?: number;
  }[];

  @ApiProperty({ example: true })
  @Column({ default: false })
  isPublished: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
