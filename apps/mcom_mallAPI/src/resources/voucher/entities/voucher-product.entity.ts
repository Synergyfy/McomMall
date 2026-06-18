import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Voucher } from './voucher.entity';
import { Expose } from 'class-transformer';

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
  @Column('decimal', {
    array: true,
    nullable: true,
    transformer: {
      to: (value: number[]) => value,
      from: (value: string[]) => value?.map(parseFloat),
    },
  })
  fixedAmounts: number[];

  @Expose()
  @Column({ default: false })
  allowCustomAmount: boolean;

  @Expose()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minCustomAmount: number;

  @Expose()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
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
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  bonusThreshold: number;

  @Expose()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
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
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
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
}
