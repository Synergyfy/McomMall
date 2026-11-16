import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
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

  @Column({ name: 'initial_value', type: 'bigint', default: 0, transformer: moneyTransformer })
  initialValue: number;

  @Column({ name: 'current_balance', type: 'bigint', default: 0, transformer: moneyTransformer })
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
