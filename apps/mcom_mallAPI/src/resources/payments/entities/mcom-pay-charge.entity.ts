import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

/**
 * Local index of MCOM Pay charges.
 *
 * MCOM Central owns the charge itself; this table exists so the mall can
 * resolve a provider id (Stripe PaymentIntent id / PayPal order id) back to the
 * MCOM charge id when verifying a payment, and so webhook/backstop processing
 * survives an API restart.
 */
@Entity('mcom_pay_charges')
@Index('IDX_mcom_pay_charge_provider_ref', ['providerRef'])
export class McomPayCharge extends AbstractBaseEntity {
  @Column({ unique: true })
  chargeId: string;

  @Column({ nullable: true })
  providerRef?: string | null;

  @Column()
  method: string;

  @Column({ type: 'bigint' })
  amountMinor: string;

  @Column({ length: 3 })
  currency: string;

  @Column({ nullable: true })
  reference?: string | null;

  @Column()
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;
}
