import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { moneyArrayTransformer, moneyTransformer } from '../../../common/money/money';
import { User } from '../../users/entities/user.entity';
import { Expose } from 'class-transformer';
import { Coupon } from './coupon.entity';
import { ApprovalStatus } from '../../../common/moderation/catalog-approval';

@Entity('coupon_products')
export class CouponProduct {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ length: 100 })
  name: string;

  @Expose()
  @Column('text', { nullable: true })
  description: string;

  @Expose()
  @Column({ type: 'bigint', array: true, nullable: true, transformer: moneyArrayTransformer })
  fixedAmounts: number[];

  @Expose()
  @Column({ default: false })
  allowCustomAmount: boolean;

  @Expose()
  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  minCustomAmount: number;

  @Expose()
  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  maxCustomAmount: number;

  @Expose()
  @Column({ default: true })
  isEnabled: boolean;

  /** Admin moderation. New merchant coupon products start pending. */
  @Index('IDX_coupon_products_approval_status')
  @Column({ type: 'varchar', default: ApprovalStatus.PENDING })
  approvalStatus: ApprovalStatus;

  @Column({ type: 'text', nullable: true })
  reviewNote?: string | null;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date | null;

  /** Set by an admin when the coupon product is delisted. */
  @Index('IDX_coupon_products_admin_disabled')
  @Column({ default: false })
  adminDisabled: boolean;

  @Expose()
  @Column({ nullable: true })
  expiryDays: number | null;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  backgroundImage: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  textColor: string;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @UpdateDateColumn()
  updatedAt: Date;

  @Expose()
  @DeleteDateColumn()
  deletedAt: Date;

  @Expose()
  @ManyToOne(() => User)
  user: User;

  // @OneToMany(() => Coupon, (coupon) => coupon.couponProduct)
  // coupons: Coupon[];

  @Expose()
  @Column({ default: false })
  allowReloading: boolean;

  @Expose()
  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  bonusThreshold: number;

  @Expose()
  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  bonusAmount: number;
}