import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Offer } from '../../offer/entities/offer.entity';
import { Order } from '../../order/entities/order.entity';
import { Promotion } from '../../promotion/entities/promotion.entity';
import { Business } from '../../listings/entities/listing.entity';

export enum PointTransactionType {
  REDEMPTION = 'REDEMPTION',
  EARNED = 'EARNED',
}

export enum PointTransactionSource {
  MANUAL = 'manual',
  PROMOTION = 'promotion',
  ORDER = 'order',
  BOOKING = 'booking',
  RULE = 'rule',
  REFERRAL = 'referral',
}

@Entity('point_transactions')
export class PointTransaction extends AbstractBaseEntity {
  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'enum', enum: PointTransactionType })
  type: PointTransactionType;

  @ManyToOne(() => Offer, { nullable: true })
  offer?: Offer;

  @ManyToOne(() => Order, { nullable: true })
  order?: Order;

  @ManyToOne(() => Promotion, { nullable: true })
  promotion?: Promotion;

  /**
   * Business that issued (or received) the points. Required to scope loyalty
   * analytics to a single tenant.
   */
  @Column({ name: 'business_id', nullable: true })
  businessId?: string;

  @ManyToOne(() => Business, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'business_id' })
  business?: Business;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason?: string;

  @Column({
    type: 'varchar',
    length: 32,
    default: PointTransactionSource.MANUAL,
  })
  source: PointTransactionSource;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date | null;
}
