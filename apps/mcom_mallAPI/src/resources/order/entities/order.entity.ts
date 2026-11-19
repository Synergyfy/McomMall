import {
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  Column,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { OrderPayment } from './order-payment.entity';
import { OrderItem } from './order-item.entity';
import { Offer } from '../../offer/entities/offer.entity';
import { Voucher } from '../../voucher/entities/voucher.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { Coupon } from '../../coupon/entities/coupon.entity';
import { ProductServiceBooking } from './product-service-booking.entity';
import { OrderItemReward } from './order-item-reward.entity';
import { ShippingStatus } from '../../shipping/enums/shipping-status.enum';
import { Business } from '../../listings/entities/listing.entity';
import { ShippingAddress } from '../../shipping-address/entities/shipping-address.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('orders')
@Index('IDX_order_user', ['user'])
@Index('IDX_order_business', ['business'])
@Index('IDX_order_status', ['status'])
export class Order extends AbstractBaseEntity {
  @ApiProperty({ type: () => User })
  @ManyToOne(() => User)
  user: User;

  @ApiPropertyOptional({ type: () => Business })
  @ManyToOne(() => Business, { nullable: true })
  business: Business;

  @ApiProperty({ type: () => [OrderItem] })
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @ApiProperty({ example: 14.5 })
  @Column({ type: 'bigint', transformer: moneyTransformer })
  total: number;

  @ApiProperty({ type: () => OrderPayment })
  @OneToOne(() => OrderPayment, (payment) => payment.order)
  @JoinColumn()
  payment: OrderPayment;

  @ApiPropertyOptional({ type: () => Offer })
  @ManyToOne(() => Offer, { nullable: true })
  appliedOffer?: Offer;

  @ApiPropertyOptional()
  @Column({ type: 'int', nullable: true })
  pointsUsedToRedeem?: number;

  @ApiProperty({ type: () => [Voucher] })
  @OneToMany(() => Voucher, (voucher) => voucher.order)
  vouchers: Voucher[];

  @ApiProperty({ enum: OrderStatus })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiPropertyOptional()
  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  giftCardAmountApplied?: number;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  giftCardCode?: string;

  @ApiPropertyOptional()
  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  couponDiscountApplied?: number;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  couponCode?: string;

  @ApiPropertyOptional({ description: 'Voucher code applied to this order.' })
  @Column({ nullable: true })
  voucherCode?: string;

  @ApiPropertyOptional({
    description: 'Amount redeemed from the voucher for this order.',
  })
  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  voucherAmountApplied: number;

  @ApiPropertyOptional({
    description: 'Money-engine wallet code applied to this order.',
  })
  @Column({ nullable: true })
  moneyVoucherCode?: string;

  @ApiPropertyOptional({
    description: 'Amount redeemed from the money-engine wallet for this order.',
  })
  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  moneyVoucherAmountApplied: number;

  @ApiPropertyOptional({
    description:
      'Real-money portion of the money-engine wallet redeemed for this order.',
  })
  @Column({
    name: 'money_voucher_real_amount_applied',
    type: 'bigint',
    default: 0,
    transformer: moneyTransformer,
  })
  moneyVoucherRealAmountApplied: number;

  @ApiPropertyOptional({
    description:
      'Reward portion of the money-engine wallet redeemed for this order.',
  })
  @Column({
    name: 'money_voucher_reward_amount_applied',
    type: 'bigint',
    default: 0,
    transformer: moneyTransformer,
  })
  moneyVoucherRewardAmountApplied: number;

  @ApiPropertyOptional({
    description: 'Voucher Coupon code applied as a single-use discount.',
  })
  @Column({ name: 'price_reducer_code', nullable: true })
  priceReducerCode?: string;

  @ApiPropertyOptional({
    description: 'Discount amount applied by the Voucher Coupon.',
  })
  @Column({
    name: 'price_reducer_amount_applied',
    type: 'bigint',
    default: 0,
    transformer: moneyTransformer,
  })
  priceReducerAmountApplied: number;

  @ApiPropertyOptional({
    description: 'Total reward discount applied (MCOM Rewards issuances).',
  })
  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  rewardDiscountApplied: number;

  @ApiPropertyOptional({
    description:
      'Discount applied by redeeming a loyalty offer with points. Stored as pence.',
  })
  @Column({
    name: 'offer_discount_applied',
    type: 'bigint',
    default: 0,
    transformer: moneyTransformer,
  })
  offerDiscountApplied: number;

  @ApiProperty({ type: () => [OrderItemReward] })
  @OneToMany(() => OrderItemReward, (reward) => reward.order)
  rewardRedemptions: OrderItemReward[];

  @ApiProperty({ type: () => [Coupon] })
  @OneToMany(() => Coupon, (coupon) => coupon.order)
  coupons: Coupon[];

  @ApiProperty({ type: () => [ProductServiceBooking] })
  @OneToMany(
    () => ProductServiceBooking,
    (productServiceBooking) => productServiceBooking.order,
  )
  productServiceBookings: ProductServiceBooking[];

  // --- Shipping Fields ---

  @ApiPropertyOptional({ type: () => ShippingAddress })
  @ManyToOne(() => ShippingAddress, { nullable: true })
  shippingAddress: ShippingAddress;

  @ApiProperty({ enum: ShippingStatus })
  @Column({
    type: 'enum',
    enum: ShippingStatus,
    default: ShippingStatus.PENDING,
  })
  shippingStatus: ShippingStatus;

  @ApiProperty({ example: 4.5 })
  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  estimatedShippingFee: number;

  @ApiPropertyOptional()
  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  actualShippingCost: number;

  @ApiPropertyOptional({ example: 'royalmail' })
  @Column({ nullable: true })
  carrierCode: string;

  @ApiPropertyOptional({ example: 'RN123456789GB' })
  @Column({ nullable: true })
  trackingNumber: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  labelUrl: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  royalMailShipmentId: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  royalMailLabelData: string;
}
