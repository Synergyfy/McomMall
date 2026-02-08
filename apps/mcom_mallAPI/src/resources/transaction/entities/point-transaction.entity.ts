import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Offer } from '../../offer/entities/offer.entity';
import { Order } from '../../order/entities/order.entity';
import { Promotion } from '../../promotion/entities/promotion.entity';

export enum PointTransactionType {
  REDEMPTION = 'REDEMPTION',
  EARNED = 'EARNED',
}

@Entity('point_transactions')
export class PointTransaction extends AbstractBaseEntity {
  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'enum', enum: PointTransactionType })
  type: PointTransactionType;

  @ManyToOne(() => Offer, { nullable: true })
  offer?: Offer;

  @ManyToOne(() => Order, { nullable: true })
  order?: Order;

  @ManyToOne(() => Promotion, { nullable: true })
  promotion?: Promotion;
}
