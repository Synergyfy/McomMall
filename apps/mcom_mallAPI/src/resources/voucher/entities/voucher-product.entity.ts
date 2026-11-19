import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { moneyArrayTransformer, moneyTransformer } from '../../../common/money/money';
import { User } from '../../users/entities/user.entity';
import { Voucher } from './voucher.entity';
import { Expose } from 'class-transformer';
import { ApprovalStatus } from '../../../common/moderation/catalog-approval';

export enum VoucherUsage {
  ONLINE_ONLY = 'online_only',
  INSTORE_ONLY = 'instore_only',
  BOTH = 'both',
}

@Entity('voucher_products')
export class VoucherProduct {
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

  @Column({
    type: 'enum',
    enum: VoucherUsage,
    default: VoucherUsage.BOTH,
  })
  usage: VoucherUsage;

  @Expose()
  @Column({ default: true })
  isEnabled: boolean;

  @Expose()
  @Column({ nullable: true })
  expiryDays: number | null; // e.g., 365 days from purchase

  @Expose()
  @Column({ default: false })
  allowPartialRedemption: boolean;

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
  @ManyToOne(() => User, (user) => user.voucherProducts)
  user: User;

  @OneToMany(() => Voucher, (voucher) => voucher.voucherProduct)
  vouchers: Voucher[];

  @Expose()
  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  bonusThreshold: number;

  @Expose()
  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  bonusAmount: number;

  @Expose()
  @Column({ default: false })
  allowReloading: boolean;

  @Expose()
  @Column({ type: 'varchar', length: 50, default: 'gift_voucher' })
  voucherType: string;

  @Expose()
  @Column({ type: 'varchar', length: 20, default: 'percentage' })
  valueType: string;

  @Expose()
  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  value: number;

  @Expose()
  @Column({ type: 'text', nullable: true })
  rules: string | null;

  @Expose()
  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date | null;

  @Expose()
  @Column({ type: 'simple-array', nullable: true })
  distributionChannels: string[] | null;

  @Expose()
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  /** Admin moderation. New merchant voucher products start pending. */
  @Index('IDX_voucher_products_approval_status')
  @Column({ type: 'varchar', default: ApprovalStatus.PENDING })
  approvalStatus: ApprovalStatus;

  @Column({ type: 'text', nullable: true })
  reviewNote?: string | null;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date | null;

  /** Set by an admin when the voucher product is delisted. */
  @Index('IDX_voucher_products_admin_disabled')
  @Column({ default: false })
  adminDisabled: boolean;

  /**
   * Optional restriction inherited by partner instruments. Shape mirrors an
   * instrument scope (`mode`, `businessId`, `listingIds`, `productIds`,
   * `serviceIds`).
   */
  @Expose()
  @Column({ name: 'scope_config', type: 'jsonb', nullable: true })
  scopeConfig: Record<string, any> | null;
}
