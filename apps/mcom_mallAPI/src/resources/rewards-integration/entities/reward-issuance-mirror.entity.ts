import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Local read-model of MCOM Rewards issuances, populated by lifecycle events
 * pushed over the mesh. Live reads remain authoritative; this mirror lets the
 * mall surface a user's rewards when the rewards peer is temporarily
 * unreachable and keeps an audit trail of status changes.
 */
@Entity('reward_issuance_mirror')
@Index('IDX_reward_mirror_recipient', ['recipientMcomUserId'])
@Index('IDX_reward_mirror_status', ['status'])
export class RewardIssuanceMirror {
  /** Same id as the MCOM Rewards issuance. */
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  rewardId?: string;

  @Column({ nullable: true })
  businessRewardId?: string;

  @Column({ nullable: true })
  rewardTitle?: string;

  @Column({ nullable: true })
  issuerClientId?: string;

  @Column({ nullable: true })
  recipientMcomUserId?: string;

  @Column({ nullable: true })
  recipientEmail?: string;

  @Column({ nullable: true })
  rewardType?: string;

  @Column({ nullable: true })
  code?: string;

  @Column({ nullable: true })
  mallReference?: string;

  @Column({ default: 'ISSUED' })
  status: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  value: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column('timestamp', { nullable: true })
  expiresAt?: Date | null;

  @Column('timestamp', { nullable: true })
  redeemedAt?: Date | null;

  @Column('timestamp', { nullable: true })
  revokedAt?: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  lastEvent?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
