import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';
import { VoucherProduct } from '../../voucher/entities/voucher-product.entity';

@Entity('events')
export class Event extends AbstractBaseEntity {
  @Column({ length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column()
  date: string;

  @Column()
  time: string;

  @Column({ type: 'int', default: 100 })
  capacity: number;

  @Column({ default: 'in-person' })
  venueType: string; // 'in-person' | 'online'

  @Column({ length: 500 })
  location: string;

  @Column({ nullable: true })
  borough?: string;

  @Column({ nullable: true })
  highStreet?: string;

  @Column({ default: 'free' })
  entryType: string; // 'free' | 'paid' | 'points' | 'invite'

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  entryPrice?: number;

  @Column('int', { nullable: true })
  entryPoints?: number;

  @Column({ nullable: true })
  selectedTemplate?: string;

  @Column({ default: false })
  promoteRotator: boolean;

  @Column({ default: false })
  promoteQR: boolean;

  @Column({ default: false })
  promoteAlert: boolean;

  @Column({ default: false })
  associateVoucher: boolean;

  @Column({ nullable: true })
  voucherProductId?: string;

  @ManyToOne(() => VoucherProduct, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'voucherProductId' })
  voucherProduct?: VoucherProduct;

  @Column({ default: false })
  createCountdown: boolean;

  @Column({ nullable: true })
  countdownTime?: string;

  @Column({ default: 'upcoming' })
  status: string; // 'active' | 'expo' | 'live' | 'upcoming' | 'draft' | 'past'

  @Column({ nullable: true })
  imageUrl?: string;

  @Column()
  businessId: string;

  @ManyToOne(() => Business, (business) => business.events, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'businessId' })
  business: Business;
}
