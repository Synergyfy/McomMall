import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { DigitalValue } from './digital-value.entity';

export enum DigitalValueTransactionType {
  FUND = 'FUND',
  REDEEM = 'REDEEM',
  TOPUP = 'TOPUP',
  REFUND = 'REFUND',
  REWARD = 'REWARD',
}

export enum DigitalValueTransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('digital_value_transactions')
export class DigitalValueTransaction extends AbstractBaseEntity {
  @ManyToOne(() => DigitalValue, (dv) => dv.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'digitalValueId' })
  digitalValue: DigitalValue;

  @Column()
  digitalValueId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: DigitalValueTransactionType,
  })
  type: DigitalValueTransactionType;

  @Column({
    type: 'enum',
    enum: DigitalValueTransactionStatus,
    default: DigitalValueTransactionStatus.PENDING,
  })
  status: DigitalValueTransactionStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
