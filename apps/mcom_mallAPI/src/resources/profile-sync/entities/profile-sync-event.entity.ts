import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

export type ProfileSyncEventStatus =
  | 'processing'
  | 'completed'
  | 'failed'
  | 'skipped';

/**
 * Durable inbox for Central's `profile.updated` signals.
 *
 * Central delivers at-least-once, so the unique `eventId` is the idempotency
 * key: a duplicate delivery is acknowledged without re-running the pull.
 * Rows are retained (rather than deleted) so a failed pull can be retried or
 * replayed manually.
 */
@Entity('mcom_profile_sync_events')
export class ProfileSyncEvent extends AbstractBaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar' })
  eventId: string;

  @Column({ type: 'varchar' })
  eventType: string;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  centralUserId: string | null;

  @Index()
  @Column({ type: 'varchar', default: 'processing' })
  status: ProfileSyncEventStatus;

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
