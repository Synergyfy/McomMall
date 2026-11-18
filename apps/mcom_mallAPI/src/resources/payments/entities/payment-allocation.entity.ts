import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

/**
 * An immutable local allocation of one MCOM Pay charge to one business event.
 *
 * A charge may only ever fund a single order / membership / booking / top-up.
 * The unique constraints here are the last line of defence against replaying a
 * paid charge to obtain a second entitlement.
 */
@Entity('payment_allocations')
@Index('IDX_payment_allocation_charge', ['mcomChargeId'])
@Index('IDX_payment_allocation_user', ['userId'])
@Index('UQ_payment_allocation_entity', ['purpose', 'entityType', 'entityId'], {
  unique: true,
})
export class PaymentAllocation extends AbstractBaseEntity {
  @Column({ unique: true })
  mcomChargeId: string;

  @Column()
  purpose: string;

  @Column()
  entityType: string;

  @Column()
  entityId: string;

  @Column()
  userId: string;

  @Column({ type: 'bigint' })
  amountMinor: string;

  @Column({ length: 3 })
  currency: string;
}
