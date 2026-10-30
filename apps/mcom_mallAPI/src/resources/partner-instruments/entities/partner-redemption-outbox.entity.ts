import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  PartnerInstrumentOperation,
  PartnerOutboxStatus,
} from '../enums';

/**
 * Transactional outbox for instrument lifecycle callbacks to MCOM Rewards.
 *
 * Rows are written inside (or immediately after) the consuming transaction
 * and delivered asynchronously, so a slow/unavailable Rewards peer never
 * blocks a checkout. The unique idempotency key guarantees exactly-once
 * enqueueing for `(operation, issuanceId, code)`.
 */
@Entity('partner_redemption_outbox')
@Index('UQ_partner_outbox_idempotency', ['idempotencyKey'], { unique: true })
@Index('IDX_partner_outbox_status_due', ['status', 'nextAttemptAt'])
export class PartnerRedemptionOutbox {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'issuance_id', nullable: true })
  issuanceId: string | null;

  @Column({ name: 'instrument_type', type: 'varchar', length: 32 })
  instrumentType: string;

  @Column({ name: 'instrument_id', type: 'uuid' })
  instrumentId: string;

  @Column({ type: 'varchar', length: 16 })
  operation: PartnerInstrumentOperation;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: PartnerOutboxStatus;

  @Column({ nullable: true, length: 64 })
  code: string | null;

  @Column({ name: 'idempotency_key', length: 255 })
  idempotencyKey: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any> | null;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ name: 'next_attempt_at', type: 'timestamp', default: () => 'now()' })
  nextAttemptAt: Date;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string | null;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
