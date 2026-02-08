import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Order } from '../order/entities/order.entity';
import {
  PointTransaction,
  PointTransactionType,
} from './entities/point-transaction.entity';

@Injectable()
export class PointsService {
  async redeemPointsForOrder(
    order: Order,
    user: User,
    offer: Offer,
    entityManager: EntityManager,
  ): Promise<void> {
    const pointsToRedeem = offer.points;

    // Create the point transaction record
    const pointTransaction = entityManager.create(PointTransaction, {
      user,
      order,
      offer,
      points: -pointsToRedeem,
      type: PointTransactionType.REDEMPTION,
    });
    await entityManager.save(pointTransaction);

    // Deduct points from user
    user.points -= pointsToRedeem;
    await entityManager.save(user);
  }
}
