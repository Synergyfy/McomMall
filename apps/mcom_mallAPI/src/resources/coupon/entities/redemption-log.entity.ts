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

export enum RedemptionStatus {
  REDEEMED = 'redeemed',
  REJECTED = 'rejected',
  FRAUD_ATTEMPT = 'fraud_attempt',
}

@Entity('redemption_logs')
export class RedemptionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Coupon, { onDelete: 'CASCADE' })
  coupon: Coupon;

  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  timestamp: Date;

  @Index()
  @Column({
    type: 'enum',
    enum: RedemptionStatus,
  })
  status: RedemptionStatus;

  @Column({ nullable: true })
  failureReason: string;
}
