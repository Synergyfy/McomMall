import { Column, Entity, OneToMany, OneToOne, AfterLoad, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Promotion } from '../../promotion/entities/promotion.entity';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Offer } from '../../offer/entities/offer.entity';
import { UserRole } from '../../../common/role.enum';
import { Business } from '../../listings/entities/listing.entity';
import { Coupon } from '../../coupon/entities/coupon.entity';
import { PromotionParticipant } from '../../promotion/entities/promotion-participant.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Social } from './social.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { Voucher } from '../../voucher/entities/voucher.entity';
import { VoucherProduct } from '../../voucher/entities/voucher-product.entity';
import { ServiceProviderProfile } from '../../service-provider-profile/entities/service-provider-profile.entity';
import { Membership } from '../../membership/entities/membership.entity';
import { ShippingAddress } from '../../shipping-address/entities/shipping-address.entity';
import { Expose } from 'class-transformer';

@Entity('users')
export class User extends AbstractBaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSuperUser: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ nullable: true })
  profilePictureUrl?: string;

  @Column({ select: false })
  password: string;

  @Expose()
  name: string;

  @AfterLoad()
  populateName() {
    this.name = `${this.firstName} ${this.lastName}`;
  }

  @BeforeInsert()
  @BeforeUpdate()
  updateFullName() {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }

  @OneToMany(() => Business, (business) => business.user)
  businesses: Business[];

  // @OneToMany(() => Coupon, (coupon) => coupon.owner)
  // coupons: Coupon[];

  // @OneToMany(() => Coupon, (coupon) => coupon.buyer)
  // purchasedCoupons: Coupon[];

  // @OneToMany(() => CouponProduct, (couponProduct) => couponProduct.user)
  // couponProducts: CouponProduct[];

  @OneToMany(
    () => PromotionParticipant,
    (promotionParticipant) => promotionParticipant.user,
  )
  promotionParticipations: PromotionParticipant[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToOne(() => Social, (socials) => socials.user, { cascade: true })
  socials: Social;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Promotion, (promotion) => promotion.user)
  promotions: Promotion[];

  @Column({ type: 'int', default: 0 })
  points: number;

  @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
  wallet: Wallet;

  @OneToMany(() => Voucher, (voucher) => voucher.buyer)
  purchasedVouchers: Voucher[];

  @OneToMany(() => VoucherProduct, (voucherProduct) => voucherProduct.user)
  voucherProducts: VoucherProduct[];

  @OneToMany(() => Voucher, (voucher) => voucher.owner)
  vouchers: Voucher[];

  @OneToMany(() => Offer, (offer) => offer.user)
  offers: Offer[];

  @OneToOne(
    () => ServiceProviderProfile,
    (serviceProviderProfile) => serviceProviderProfile.user,
    { cascade: true },
  )
  serviceProviderProfile: ServiceProviderProfile;

  @OneToOne(() => Membership, (membership) => membership.user, { cascade: true })
  membership: Membership;

  @OneToMany(() => ShippingAddress, (address) => address.user)
  shippingAddresses: ShippingAddress[];

  @Column({ default: true })
  giftCard: boolean;

  @Column({ default: true })
  voucher: boolean;

  @Column({ default: true })
  promotion: boolean;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ type: 'int', default: 100 })
  trustScore: number;
}
