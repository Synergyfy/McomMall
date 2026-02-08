import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('wallets')
export class Wallet extends AbstractBaseEntity {
  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  balance: number;

  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  earningsBalance: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  spendableBalance: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  pendingBalance: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  earningsFromOrders: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  earningsFromGiftCard: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  earningsFromVoucher: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  earningsFromBookings: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  earningsFromCoupons: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  earningsFromTerminalCashback: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
