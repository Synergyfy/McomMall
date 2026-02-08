import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { CouponTransaction } from './coupon-transaction.entity';
import { CouponStatus } from '../coupon.enum';
import { Order } from '../../order/entities/order.entity';
import { CouponProduct } from './coupon-product.entity';

@Entity('coupons')
export class Coupon extends AbstractBaseEntity {
  @Column({ unique: true, length: 20 })
  code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  initialValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance: number;

  @Column({
    type: 'enum',
    enum: CouponStatus,
    default: CouponStatus.UNREDEEMED,
  })
  status: CouponStatus;

  @Column({ nullable: true })
  recipientName?: string;

  @Column({ nullable: true })
  recipientEmail?: string;

  @Column({ type: 'text', nullable: true })
  personalMessage?: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deliveryDate: Date | null;

  @ManyToOne(() => User, (user) => user.coupons)
  owner: User;

  @ManyToOne(() => User, (user) => user.purchasedCoupons)
  buyer: User;

  @ManyToOne(() => User, { nullable: true })
  recipient?: User;

  @ManyToOne(() => Order, (order) => order.coupons)
  order: Order;

  @ManyToOne(() => CouponProduct, (product) => product.coupons)
  couponProduct: CouponProduct;

  @OneToMany(() => CouponTransaction, (transaction) => transaction.coupon)
  transactions: CouponTransaction[];
}
