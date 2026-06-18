import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Business } from '../../listings/entities/listing.entity';

export enum QrType {
  STOREFRONT = 'storefront',
  PRODUCT = 'product',
  EVENT = 'event',
  PROMO = 'promo',
  REWARD = 'reward',
}

export enum QrStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
}

@Entity('qr_codes')
export class QrCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: QrType,
    default: QrType.STOREFRONT,
  })
  qrType: QrType;

  @Column({ nullable: true })
  targetId?: string;

  @Column({
    type: 'enum',
    enum: QrStatus,
    default: QrStatus.ACTIVE,
  })
  status: QrStatus;

  @Column({ type: 'int', default: 0 })
  scanCount: number;

  @Column({ nullable: true })
  shortUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column()
  businessId: string;
}
