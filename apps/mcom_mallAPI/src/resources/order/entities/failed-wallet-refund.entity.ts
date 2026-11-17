import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';

export enum FailedRefundStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('failed_wallet_refunds')
@Index('IDX_failed_refund_status', ['status'])
@Index('IDX_failed_refund_idempotency', ['idempotencyKey'], { unique: true })
export class FailedWalletRefund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  mallUserId: string;

  @Column({ nullable: true })
  centralUserId: string;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  amount: number;

  @Column()
  idempotencyKey: string;

  @Column({ nullable: true })
  walletTransactionId: string;

  @Column('text', { nullable: true })
  failureReason: string;

  @Column({ default: 0 })
  attempts: number;

  @Column({
    type: 'enum',
    enum: FailedRefundStatus,
    default: FailedRefundStatus.PENDING,
  })
  status: FailedRefundStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
