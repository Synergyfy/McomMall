import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';

/**
 * Per-business configuration for how customers earn loyalty points.
 *
 * A single row exists per business. Points are only awarded to customers who
 * have joined the business's loyalty programme.
 */
@Entity('loyalty_earning_configs')
export class LoyaltyEarningConfig extends AbstractBaseEntity {
  /** True once a merchant has explicitly saved their earning rules. */
  @Column({ default: false })
  isConfigured: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  earnOnProducts: boolean;

  @Column({ default: false })
  earnOnServices: boolean;

  /** Points awarded per whole unit of currency spent (e.g. 1 point per £1). */
  @Column({ type: 'int', default: 1 })
  pointsPerCurrency: number;

  /** Flat bonus added once per order/booking that earns points. */
  @Column({ type: 'int', default: 0 })
  fixedPointsPerOrder: number;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  minSpend?: number | null;

  /** When empty, every product in scope earns points. */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  includedProductIds: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  excludedProductIds: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  includedServiceIds: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  excludedServiceIds: string[];

  /** Custom flat points per product, overriding the spend-based calculation. */
  @Column({ type: 'jsonb', default: () => "'{}'" })
  productPointOverrides: Record<string, number>;

  /** Custom flat points per service, overriding the spend-based calculation. */
  @Column({ type: 'jsonb', default: () => "'{}'" })
  servicePointOverrides: Record<string, number>;

  @Column({ unique: true })
  @Index()
  businessId: string;

  @OneToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;
}
