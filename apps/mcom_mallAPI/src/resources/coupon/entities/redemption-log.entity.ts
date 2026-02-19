import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Coupon } from './coupon.entity';
import { User } from '../../users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RedemptionStatus {
  REDEEMED = 'redeemed',
  REJECTED = 'rejected',
  FRAUD_ATTEMPT = 'fraud_attempt',
}

@Entity('redemption_logs')
export class RedemptionLog {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => Coupon })
  @Index()
  @ManyToOne(() => Coupon, { onDelete: 'CASCADE' })
  coupon: Coupon;

  @ApiProperty({ type: () => User })
  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ApiProperty()
  @CreateDateColumn()
  timestamp: Date;

  @ApiProperty({ enum: RedemptionStatus, example: RedemptionStatus.REDEEMED })
  @Index()
  @Column({
    type: 'enum',
    enum: RedemptionStatus,
  })
  status: RedemptionStatus;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  failureReason: string;
}
