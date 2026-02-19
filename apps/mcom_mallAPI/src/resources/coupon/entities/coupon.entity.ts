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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('coupons')
export class Coupon extends AbstractBaseEntity {
  @ApiProperty({ example: 'SAVE20' })
  @Index({ unique: true })
  @Column({ length: 20 })
  code: string;

  @ApiPropertyOptional({ example: '20% Off Winter Sale' })
  @Column({ nullable: true })
  title: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ enum: CouponSourceType, example: CouponSourceType.PLATFORM })
  @Index()
  @Column({
    type: 'enum',
    enum: CouponSourceType,
    default: CouponSourceType.PLATFORM,
  })
  sourceType: CouponSourceType;

  @ApiProperty({ example: 20 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountValue: number;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @Column({
    type: 'enum',
    enum: DiscountType,
    default: DiscountType.FIXED,
  })
  discountType: DiscountType;

  @ApiProperty({ description: 'Total redemptions allowed. 0 for unlimited.', example: 100 })
  @Column({ default: 0 })
  usageLimit: number; // 0 = unlimited

  @ApiProperty({ description: 'Redemptions allowed per user.', example: 1 })
  @Column({ default: 1 })
  perUserLimit: number;

  @ApiProperty({ enum: CouponStatus, example: CouponStatus.ACTIVE })
  @Index()
  @Column({
    type: 'enum',
    enum: CouponStatus,
    default: CouponStatus.DRAFT,
  })
  status: CouponStatus;

  @ApiPropertyOptional()
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @ApiPropertyOptional({ type: () => Business })
  @Index()
  @ManyToOne(() => Business, { nullable: true })
  business: Business;

  @ApiPropertyOptional({ type: () => MarketingCampaign })
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
