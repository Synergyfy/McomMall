import {
  Entity,
  ManyToOne,
  OneToOne,
  Column,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { OrderPayment } from './order-payment.entity';
import { OrderItem } from './order-item.entity';
import { Offer } from '../../offer/entities/offer.entity';
import { Voucher } from '../../voucher/entities/voucher.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { Coupon } from '../../coupon/entities/coupon.entity';
import { ProductServiceBooking } from './product-service-booking.entity';
import { ShippingStatus } from '../../shipping/enums/shipping-status.enum';
import { Business } from '../../listings/entities/listing.entity';

@Entity('orders')
export class Order extends AbstractBaseEntity {
  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Business, { nullable: true })
  business: Business;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @Column('decimal')
  total: number;

  @OneToOne(() => OrderPayment, (payment) => payment.order)
  @JoinColumn()
  payment: OrderPayment;

  @ManyToOne(() => Offer, { nullable: true })
  appliedOffer?: Offer;

  @Column({ type: 'int', nullable: true })
  pointsUsedToRedeem?: number;

  @OneToMany(() => Voucher, (voucher) => voucher.order)
  vouchers: Voucher[];
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  giftCardAmountApplied?: number;

  @Column({ nullable: true })
  giftCardCode?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  couponDiscountApplied?: number;

  @Column({ nullable: true })
  couponCode?: string;

  @OneToMany(() => Coupon, (coupon) => coupon.order)
  coupons: Coupon[];

  @OneToMany(
    () => ProductServiceBooking,
    (productServiceBooking) => productServiceBooking.order,
  )
  productServiceBookings: ProductServiceBooking[];

  // --- Shipping Fields ---

  @Column({
    type: 'enum',
    enum: ShippingStatus,
    default: ShippingStatus.PENDING,
  })
  shippingStatus: ShippingStatus;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  estimatedShippingFee: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  actualShippingCost: number;

  @Column({ nullable: true })
  carrierCode: string;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ nullable: true })
  labelUrl: string;
}
