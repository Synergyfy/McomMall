import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RewardOutboxStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum RewardOutboxOperation {
  COMMIT = 'COMMIT',
  RELEASE = 'RELEASE',
}

/**
 * Durable outbox for reward-issuance lifecycle calls to MCOM Rewards that fail
 * after the local order has been committed. Retried by the reconcile service.
 */
@Entity('reward_redemption_outbox')
@Index('IDX_reward_outbox_status', ['status'])
@Index('IDX_reward_outbox_idempotency', ['idempotencyKey'], { unique: true })
export class RewardRedemptionOutbox {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  rewardIssuanceId: string;

  @Column({ nullable: true })
  orderId?: string;

  @Column({ nullable: true })
  reservationRef?: string;

  @Column({
    type: 'enum',
    enum: RewardOutboxOperation,
  })
  operation: RewardOutboxOperation;

  @Column()
  idempotencyKey: string;

  @Column('text', { nullable: true })
  failureReason?: string;

  @Column({ default: 0 })
  attempts: number;

  @Column({
    type: 'enum',
    enum: RewardOutboxStatus,
    default: RewardOutboxStatus.PENDING,
  })
  status: RewardOutboxStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
