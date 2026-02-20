import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum TerminalCashbackStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  AUTO_APPROVED = 'AUTO_APPROVED',
}

@Entity('terminal_cashback_claims')
export class TerminalCashbackClaim extends AbstractBaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'ID of the user who submitted the claim' })
  @Column()
  userId: string;

  @ApiProperty({ example: 'owner-uuid-here', description: 'ID of the onboarded owner' })
  @Column()
  ownerId: string;

  @ApiProperty({ example: 3.50, description: 'Cashback amount claimed' })
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ example: 15.00, description: 'Total spend amount on the receipt' })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  spendAmount: number;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/v1/receipt.jpg', description: 'URL of the proof image', nullable: true })
  @Column({ nullable: true })
  proofUrl: string;

  @ApiProperty({ enum: TerminalCashbackStatus, example: TerminalCashbackStatus.PENDING, description: 'Current status of the claim' })
  @Column({
    type: 'enum',
    enum: TerminalCashbackStatus,
    default: TerminalCashbackStatus.PENDING,
  })
  status: TerminalCashbackStatus;

  @ApiProperty({ example: '2023-10-27T10:30:00Z', description: 'When the claim was submitted' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;

  @ApiProperty({ example: '2023-10-27T12:00:00Z', description: 'When the claim was reviewed', nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @ApiProperty({ example: { gps: { lat: 51.5074, lng: -0.1278 }, deviceId: 'device_123' }, description: 'Fraud detection metadata', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any>;

  @ApiProperty({ example: 0, description: 'Risk score from 0-100 (0 = Safe, 100 = Fraud)' })
  @Column({ type: 'int', default: 0 })
  riskScore: number;

  @ApiProperty({ example: 'Duplicate Receipt Hash', description: 'Reason if flagged for fraud', nullable: true })
  @Column({ nullable: true })
  flaggedReason: string;
}