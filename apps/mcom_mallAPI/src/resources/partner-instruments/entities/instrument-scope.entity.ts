import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { InstrumentType, ScopeMode } from '../enums';

/**
 * Polymorphic scope attached to a partner-issued instrument.
 *
 * A row is only written when a partner supplies a scope (or a business
 * binding). Instruments without a row keep the historic `NO_SCOPE`
 * behaviour, which is why the checkout code treats a missing row as
 * unrestricted.
 */
@Entity('instrument_scopes')
@Index('IDX_instrument_scopes_instrument', ['instrumentType', 'instrumentId'])
@Index('IDX_instrument_scopes_business', ['businessId'])
export class InstrumentScope extends AbstractBaseEntity {
  @Column({
    name: 'instrument_type',
    type: 'varchar',
    length: 32,
  })
  instrumentType: InstrumentType;

  @Column({ name: 'instrument_id', type: 'uuid' })
  instrumentId: string;

  @Column({ name: 'business_id', type: 'uuid', nullable: true })
  businessId: string | null;

  @Column({
    name: 'scope_mode',
    type: 'varchar',
    length: 16,
    default: ScopeMode.NO_SCOPE,
  })
  scopeMode: ScopeMode;

  @Column({ name: 'listing_ids', type: 'uuid', array: true, default: '{}' })
  listingIds: string[];

  @Column({ name: 'product_ids', type: 'uuid', array: true, default: '{}' })
  productIds: string[];

  @Column({ name: 'service_ids', type: 'uuid', array: true, default: '{}' })
  serviceIds: string[];
}
