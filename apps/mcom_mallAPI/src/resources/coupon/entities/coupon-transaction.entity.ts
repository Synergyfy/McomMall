import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../order/entities/order.entity';
import { Coupon } from './coupon.entity';
import { TransactionType } from '../coupon.enum';

@Entity('coupon_transactions')
export class CouponTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Coupon, {
    onDelete: 'CASCADE',
  })
  coupon: Coupon;

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

  @ManyToOne(() => User, { nullable: true })
  processedBy: User;

  @ManyToOne(() => Order, { nullable: true })
  order: Order;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: 'Balance before the transaction' })
  balanceBefore: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: 'Balance after the transaction' })
  balanceAfter: number;
}