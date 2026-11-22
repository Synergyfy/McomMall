import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { PlanVariant } from '../../plans/entities/plan-variant.entity';
import { PlanType } from '../dto/initiate-membership-payment.dto';

/**
 * A MCOM Central Hub Solution (CHS) membership that bundles a Mall plan.
 *
 * Grants live in their own table instead of `memberships` so they can never
 * overwrite a plan the business bought directly from the Mall:
 *
 *   direct Mall purchase / trial  (memberships)
 *   CHS bundled membership        (mcom_central_membership_grants)
 *
 * Entitlement resolution uses the direct Mall plan while it is active, then
 * falls back to this grant. Central owns the billing relationship, so nothing
 * in this row is locally renewable or chargeable.
 */
@Entity('mcom_central_membership_grants')
export class CentralMembershipGrant extends AbstractBaseEntity {
  @ApiProperty({ description: 'Local user that owns this entitlement' })
  @Index({ unique: true })
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: 'Central user id that owns the CHS membership' })
  @Index()
  @Column({ name: 'central_user_id', type: 'varchar' })
  centralUserId: string;

  @ApiProperty({ description: 'Mapped local plan variant', nullable: true })
  @Index()
  @Column({ name: 'plan_variant_id', type: 'uuid', nullable: true })
  planVariantId: string | null;

  @ManyToOne(() => PlanVariant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'plan_variant_id' })
  planVariant: PlanVariant | null;

  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @ApiProperty({ example: 'active' })
  @Index()
  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @ApiProperty({ example: '2026-11-22T10:15:00Z', nullable: true })
  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt: Date | null;

  @ApiProperty({ example: '2027-11-22T00:00:00Z', nullable: true })
  @Index()
  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @ApiProperty({ enum: PlanType, example: PlanType.MONTHLY })
  @Column({ name: 'plan_type', type: 'varchar', default: PlanType.MONTHLY })
  planType: PlanType;

  @Column({ name: 'membership_plan_name', type: 'varchar', nullable: true })
  membershipPlanName: string | null;

  @Column({ name: 'package_name', type: 'varchar', nullable: true })
  packageName: string | null;

  @Column({ name: 'external_plan_id', type: 'varchar', nullable: true })
  externalPlanId: string | null;

  @Column({ name: 'last_event_id', type: 'varchar', nullable: true })
  lastEventId: string | null;

  @Column({ name: 'last_synced_at', type: 'timestamptz', nullable: true })
  lastSyncedAt: Date | null;

  /** Raw Central membership/package payload, retained for audit and replay. */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;
}
