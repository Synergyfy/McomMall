import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../listings/entities/listing.entity';
import { DigitalValueStatus, DigitalValueType } from '../digital-value.enums';
import { DigitalValueTransaction } from './digital-value-transaction.entity';

@Entity('digital_value_master')
export class DigitalValueMaster extends AbstractBaseEntity {
  @Column({
    type: 'enum',
    enum: DigitalValueType,
  })
  type: DigitalValueType;

  @Index({ unique: true })
  @Column({ unique: true })
  code: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => Business, { nullable: true })
  @JoinColumn({ name: 'merchant_id' })
  merchant: Business;

  @Column({ name: 'merchant_id', nullable: true })
  merchantId: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    name: 'initial_value',
  })
  initialValue: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    name: 'current_balance',
  })
  currentBalance: number;

  @Column({
    type: 'enum',
    enum: DigitalValueStatus,
    default: DigitalValueStatus.DRAFT,
  })
  status: DigitalValueStatus;

  @Column({ type: 'timestamp', name: 'expiry_date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @OneToMany(
    () => DigitalValueTransaction,
    (transaction) => transaction.digitalValue,
  )
  transactions: DigitalValueTransaction[];
}
