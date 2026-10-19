import {
  Column,
  Entity,
  Index,
  ManyToOne,
  Unique,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';

export enum RewardRedemptionStatus {
  RESERVED = 'RESERVED',
  COMMITTED = 'COMMITTED',
  RELEASED = 'RELEASED',
}

export enum RewardTargetType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

/**
 * Records a reward-issuance → order-line discount. One row per applied reward;
 * the reward is reserved at checkout and committed once the order is paid.
 */
@Entity('order_item_rewards')
@Index('IDX_order_item_reward_order', ['order'])
@Index('IDX_order_item_reward_issuance', ['rewardIssuanceId'])
@Unique('UQ_order_item_reward_order_issuance', ['orderId', 'rewardIssuanceId'])
export class OrderItemReward extends AbstractBaseEntity {
  @ManyToOne(() => Order, (order) => order.rewardRedemptions, {
    onDelete: 'CASCADE',
  })
  order: Order;

  @Column()
  orderId: string;

  @ManyToOne(() => OrderItem, { nullable: true, onDelete: 'SET NULL' })
  orderItem?: OrderItem;

  @Column({ nullable: true })
  orderItemId?: string;

  /** MCOM Rewards issuance id (source of truth lives in rewards). */
  @Column()
  rewardIssuanceId: string;

  /** Rewards clientId that issued the award, if known. */
  @Column({ nullable: true })
  issuerClientId?: string;

  @Column({ nullable: true })
  rewardType?: string;

  @Column({
    type: 'enum',
    enum: RewardTargetType,
    default: RewardTargetType.PRODUCT,
  })
  targetType: RewardTargetType;

  /** Mall product id or service id that the reward discounted. */
  @Column()
  targetId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  discountAmount: number;

  @Column({
    type: 'enum',
    enum: RewardRedemptionStatus,
    default: RewardRedemptionStatus.RESERVED,
  })
  status: RewardRedemptionStatus;

  @Column({ nullable: true })
  reservationRef?: string;

  @Column('timestamp', { nullable: true })
  committedAt?: Date | null;

  @Column('timestamp', { nullable: true })
  releasedAt?: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
