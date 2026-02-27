import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Voucher } from './voucher.entity';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../order/entities/order.entity';

export enum TransactionType {
  PURCHASE = 'purchase',
  RELOAD = 'reload',
  REDEMPTION = 'redemption',
  REVERSAL = 'reversal',
  REFUND = 'refund',
}

@Entity('voucher_transactions')
export class VoucherTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Voucher, (voucher) => voucher.transactions, {
    onDelete: 'CASCADE',
  })
  voucher: Voucher;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.REDEMPTION,
  })
  type: TransactionType;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  notes: string;

  // The staff member who processed the transaction
  @ManyToOne(() => User, { nullable: true })
  processedBy: User;

  // The order in which this voucher was used
  @ManyToOne(() => Order, { nullable: true })
  order: Order;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'Balance before the transaction',
  })
  balanceBefore: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'Balance after the transaction',
  })
  balanceAfter: number;
}
