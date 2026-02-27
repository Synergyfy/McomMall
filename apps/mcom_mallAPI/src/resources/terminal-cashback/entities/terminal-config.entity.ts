import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum TerminalLevel {
  VERIFIED_L1 = 1,
  FIXED_L2 = 2,
  ENTERPRISE_L3 = 3,
}

@Entity('terminal_configs')
export class TerminalConfig extends AbstractBaseEntity {
  @ApiProperty({
    example: 'user-uuid-here',
    description: 'Unique Owner/User ID',
  })
  @PrimaryColumn()
  userId: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Display name of the owner',
  })
  @Column()
  userName: string;

  @ApiProperty({
    enum: TerminalLevel,
    example: TerminalLevel.VERIFIED_L1,
    description: 'Protocol Level (1=Ranges, 2=Fixed, 3=API)',
  })
  @Column({
    type: 'enum',
    enum: TerminalLevel,
    default: TerminalLevel.VERIFIED_L1,
  })
  level: TerminalLevel;

  @ApiProperty({
    example: true,
    description: 'Is the terminal currently active?',
  })
  @Column({ default: true })
  isEnabled: boolean;

  @ApiProperty({
    example: 48,
    description: 'Hours before auto-approval kicks in',
  })
  @Column({ default: 48 })
  autoApprovalHours: number;

  @ApiProperty({
    example: [
      { id: '1', minSpend: 10, maxSpend: 50, rewardValue: 2, isActive: true },
    ],
    description: 'Reward ranges for Level 1',
    nullable: true,
  })
  @Column('jsonb', { nullable: true })
  ranges: {
    id: string;
    minSpend: number;
    maxSpend: number;
    rewardValue: number;
    isActive: boolean;
  }[];

  @ApiProperty({
    example: 1.5,
    description: 'Fixed reward amount for Level 2',
    nullable: true,
  })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  fixedRewardValue: number;

  @ApiProperty({
    example: 'https://api.merchant.com/verify',
    description: 'External POS endpoint for Level 3',
    nullable: true,
  })
  @Column({ nullable: true })
  apiEndpoint: string;

  @ApiProperty({
    example: { maxPerDay: 100, monthlyBudget: 5000 },
    description: 'Economic guardrails',
  })
  @Column('jsonb', { default: {} })
  limits: {
    maxPerDay: number;
    maxPerCustomer: number;
    maxPerReceipt: number;
    monthlyBudget: number;
    maxClaimsPerUser: number;
  };

  @ApiProperty({ example: '2023-10-27T10:30:00Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
