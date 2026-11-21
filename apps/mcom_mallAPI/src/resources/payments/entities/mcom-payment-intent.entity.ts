import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

/**
 * A quote-bound checkout payment attempt.
 *
 * The storefront creates the MCOM Pay charge from this row *before* the buyer
 * pays, so the webhook can finish the order even if the browser closes after
 * the provider confirms. It also freezes the quote and payee splits that were
 * shown to the buyer.
 */
@Entity('mcom_payment_intents')
@Index('UQ_mcom_payment_intent_idempotency', ['idempotencyKey'], {
  unique: true,
})
@Index('IDX_mcom_payment_intent_charge', ['chargeId'])
@Index('IDX_mcom_payment_intent_status', ['status'])
export class McomPaymentIntent extends AbstractBaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ default: 'pending' })
  status: string;

  /** stripe | paypal */
  @Column()
  provider: string;

  @Column({ type: 'bigint' })
  amountMinor: string;

  @Column({ length: 3, default: 'GBP' })
  currency: string;

  @Column({ nullable: true })
  chargeId?: string | null;

  /** Stripe PaymentIntent id or PayPal order id. */
  @Column({ nullable: true })
  providerRef?: string | null;

  @Column({ unique: true })
  idempotencyKey: string;

  /** Charge reference; webhook fallback lookup uses this. */
  @Column({ nullable: true })
  reference?: string | null;

  /** The exact checkout inputs (without `payment`) used for the quote. */
  @Column({ type: 'jsonb' })
  quote: Record<string, any>;

  /** Cash payee splits sent to MCOM Pay (empty when splits are disabled). */
  @Column({ type: 'jsonb', nullable: true })
  splits?: Record<string, any>[] | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @Column({ type: 'uuid', nullable: true })
  completedOrderId?: string | null;

  @Column({ type: 'text', nullable: true })
  failureReason?: string | null;
}
