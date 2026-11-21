import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

/**
 * Durable inbox for MCOM Pay webhooks.
 *
 * Webhooks are at-least-once. We persist the raw payload plus a hash so a
 * replayed delivery is processed exactly once, and the original event stays
 * available for audit/reconciliation.
 */
@Entity('mcom_pay_webhook_events')
@Index('IDX_mcom_pay_webhook_charge', ['chargeId'])
export class McomPayWebhookEvent extends AbstractBaseEntity {
  @Column()
  event: string;

  @Column({ nullable: true })
  chargeId?: string | null;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ unique: true })
  rawHash: string;

  @Column({ default: true })
  signatureVerified: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt?: Date | null;

  /** Atomic claim so two deliveries cannot process the event concurrently. */
  @Column({ type: 'timestamptz', nullable: true })
  processingAt?: Date | null;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'text', nullable: true })
  lastError?: string | null;
}
