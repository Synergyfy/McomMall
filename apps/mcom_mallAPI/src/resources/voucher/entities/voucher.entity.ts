import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../order/entities/order.entity';
import { VoucherProduct } from './voucher-product.entity';
import { VoucherTransaction } from './voucher-transaction.entity';

export enum VoucherStatus {
  UNREDEEMED = 'unredeemed',
  REDEEMED = 'redeemed',
  PARTIALLY_REDEEMED = 'partially_redeemed',
  EXPIRED = 'expired',
  DISABLED = 'disabled',
}

@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  initialValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance: number;

  @Column({
    type: 'enum',
    enum: VoucherStatus,
    default: VoucherStatus.UNREDEEMED,
  })
  status: VoucherStatus;

  @Column({ nullable: true })
  recipientName?: string;

  @Column({ nullable: true })
  recipientEmail?: string;

  @Column({ type: 'text', nullable: true })
  personalMessage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deliveryDate: Date | null;

  @ManyToOne(() => User, (user) => user.vouchers, { nullable: true })
  owner: User;

  @ManyToOne(() => User, (user) => user.purchasedVouchers, { nullable: true })
  buyer: User;

  @ManyToOne(() => User, { nullable: true })
  recipient?: User;

  @ManyToOne(() => Order, (order) => order.vouchers, { nullable: true })
  order: Order;

  @ManyToOne(() => VoucherProduct, (product) => product.vouchers, {
    nullable: true,
  })
  voucherProduct: VoucherProduct;

  @OneToMany(() => VoucherTransaction, (transaction) => transaction.voucher)
  transactions: VoucherTransaction[];
}
