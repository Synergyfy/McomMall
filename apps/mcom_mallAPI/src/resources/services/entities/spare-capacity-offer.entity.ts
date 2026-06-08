import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Service } from './service.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum SpareCapacityStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  BOOKED = 'booked',
}

@Entity('spare_capacity_offers')
export class SpareCapacityOffer extends AbstractBaseEntity {
  @ApiProperty({ description: 'Spare capacity offer ID' })
  id: string;

  @ManyToOne(() => Service, (service) => service.spareCapacityOffers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column()
  serviceId: string;

  @ApiProperty({ description: 'Headline shown in the Local Mall feed' })
  @Column({ length: 160 })
  headline: string;

  @ApiProperty({ description: 'Optional note / description for the offer' })
  @Column({ type: 'text', nullable: true })
  note?: string;

  @ApiProperty({ description: 'Discount percentage applied to the service price' })
  @Column({ type: 'int', default: 0 })
  discountPercent: number;

  @ApiProperty({ description: 'The discounted price in pence/minor currency unit', nullable: true })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  discountedPrice?: number;

  @ApiProperty({ description: 'Original/base price of the service at time of publishing' })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  originalPrice?: number;

  @ApiProperty({ description: 'Time slots offered (array of { date, startTime, endTime })' })
  @Column({ type: 'jsonb' })
  slots: Array<{
    date: string;       // ISO date: "2024-06-10"
    startTime: string;  // "09:00"
    endTime: string;    // "11:00"
  }>;

  @ApiProperty({ description: 'Number of slots available' })
  @Column({ type: 'int', default: 1 })
  totalSlots: number;

  @ApiProperty({ description: 'Number of slots already booked' })
  @Column({ type: 'int', default: 0 })
  bookedSlots: number;

  @ApiProperty({ description: 'Offer expires at this datetime' })
  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @ApiProperty({ enum: SpareCapacityStatus })
  @Column({
    type: 'enum',
    enum: SpareCapacityStatus,
    default: SpareCapacityStatus.ACTIVE,
  })
  status: SpareCapacityStatus;

  @ApiProperty({ description: 'Whether the offer is featured in the Local Mall feed' })
  @Column({ default: true })
  isLiveFeed: boolean;

  @ApiProperty({ description: 'Borough / area tag for the Local Mall feed', nullable: true })
  @Column({ nullable: true })
  boroughTag?: string;

  @DeleteDateColumn()
  deletedAt?: Date;
}
