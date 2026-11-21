import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

/**
 * Local index of MCOM Pay charges.
 *
 * MCOM Central owns the charge itself; this table is an audit-friendly mirror
 * so the mall can resolve provider handles, link a charge to a business event,
 * report fees/net, and reconcile even after an API restart.
 */
@Entity('mcom_pay_charges')
@Index('IDX_mcom_pay_charge_provider_ref', ['providerRef'])
@Index('IDX_mcom_pay_charge_status', ['status'])
@Index('IDX_mcom_pay_charge_reference', ['reference'])
@Index('IDX_mcom_pay_charge_user', ['mcomUserId'])
export class McomPayCharge extends AbstractBaseEntity {
  @Column({ unique: true })
  chargeId: string;

  @Column({ nullable: true })
  appClientId?: string | null;

  @Column({ nullable: true })
  providerRef?: string | null;

  @Column()
  method: string;

  @Column({ type: 'bigint' })
  amountMinor: string;

  @Column({ type: 'bigint', nullable: true })
  feeMinor?: string | null;

  @Column({ type: 'bigint', nullable: true })
  netMinor?: string | null;

  @Column({ type: 'bigint', default: 0 })
  refundedMinor: string;

  @Column({ length: 3 })
  currency: string;

  @Column({ nullable: true })
  reference?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ nullable: true })
  mcomUserId?: string | null;

  @Column({ nullable: true })
  externalCustomerId?: string | null;

  @Column({ nullable: true })
  provider?: string | null;

  @Column({ type: 'bigint', nullable: true })
  walletDebitAmount?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt?: Date | null;

  @Column()
  status: string;

  /** Ledger intent label sent to MCOM Pay (ORDER, BOOKING, ...). */
  @Column({ nullable: true })
  intent?: string | null;

  /** Payee splits used for this charge (empty when not applicable). */
  @Column({ type: 'jsonb', nullable: true })
  splits?: Record<string, any>[] | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;
}
