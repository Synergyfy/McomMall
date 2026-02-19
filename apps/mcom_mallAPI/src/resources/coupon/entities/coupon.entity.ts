import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { CouponStatus, CouponSourceType, DiscountType } from '../coupon.enum';
import { MarketingCampaign } from '../../campaign/entities/marketing-campaign.entity';
import { Business } from '../../listings/entities/listing.entity';
import { BrandingAssociation } from './branding-association.entity';
import { RedemptionLog } from './redemption-log.entity';
import { Order } from '../../order/entities/order.entity';

@Entity('coupons')
export class Coupon extends AbstractBaseEntity {
  @Index({ unique: true })
  @Column({ length: 20 })
  code: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Index()
  @Column({
    type: 'enum',
    enum: CouponSourceType,
    default: CouponSourceType.PLATFORM,
  })
  sourceType: CouponSourceType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountValue: number;

  @Column({
    type: 'enum',
    enum: DiscountType,
    default: DiscountType.FIXED,
  })
  discountType: DiscountType;

  @Column({ default: 0 })
  usageLimit: number; // 0 = unlimited

  @Column({ default: 1 })
  perUserLimit: number;

  @Index()
  @Column({
    type: 'enum',
    enum: CouponStatus,
    default: CouponStatus.DRAFT,
  })
  status: CouponStatus;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Index()
  @ManyToOne(() => Business, { nullable: true })
  business: Business;

  @Index()
  @ManyToOne(() => MarketingCampaign, (campaign) => campaign.coupons, { nullable: true })
  campaign: MarketingCampaign;

  @OneToOne(() => BrandingAssociation, (branding) => branding.coupon, { nullable: true, cascade: true })
  branding: BrandingAssociation;

  // @ManyToOne(() => User, (user) => user.purchasedCoupons)
  // buyer: User;

  // @ManyToOne(() => User, { nullable: true })
  // recipient?: User;

  @ManyToOne(() => Order, (order) => order.coupons)
  order: Order;

  // @ManyToOne(() => CouponProduct, (product) => product.coupons)
  // couponProduct: CouponProduct;

  // @OneToMany(() => CouponTransaction, (transaction) => transaction.coupon)
  // transactions: CouponTransaction[];

  @OneToMany(() => RedemptionLog, (log) => log.coupon)
  redemptionLogs: RedemptionLog[];
}
