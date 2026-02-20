import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { DigitalValueMaster } from './digital-value-master.entity';
import { DigitalValueTransactionType } from '../digital-value.enums';

@Entity('digital_value_transactions')
export class DigitalValueTransaction extends AbstractBaseEntity {
  @ManyToOne(() => DigitalValueMaster, (master) => master.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'digital_value_id' })
  digitalValue: DigitalValueMaster;

  @Column({ name: 'digital_value_id' })
  digitalValueId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: DigitalValueTransactionType,
  })
  type: DigitalValueTransactionType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
