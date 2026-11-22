import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

export type MembershipSyncEventStatus =
  | 'processing'
  | 'completed'
  | 'failed'
  | 'skipped';

/**
 * Durable inbox for Central's `membership.updated` notifications.
 *
 * Central delivers at-least-once, so the unique `eventId` is the idempotency
 * key: a duplicate delivery is acknowledged without re-applying the grant.
 * Rows are retained (rather than deleted) so a failed delivery can be
 * inspected and replayed from Central's dead-letter queue.
 */
@Entity('mcom_membership_sync_events')
export class MembershipSyncEvent extends AbstractBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar' })
  eventId: string;

  @Column({ type: 'varchar' })
  eventType: string;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  centralUserId: string | null;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  businessId: string | null;

  /** Central's plan/package id, kept for auditing plan-mapping decisions. */
  @Column({ type: 'varchar', nullable: true })
  externalPlanId: string | null;

  @Column({ type: 'varchar', default: 'processing' })
  status: MembershipSyncEventStatus;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  occurredAt: Date | null;

  @Column({ type: 'text', nullable: true })
  lastError: string | null;

  /** The raw signal payload, kept for auditing / replay. */
  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt: Date | null;
}
