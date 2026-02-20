import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CouponTransaction } from './entities/coupon-transaction.entity';
import { User } from '../users/entities/user.entity';
import { Coupon } from './entities/coupon.entity';
import { Order } from '../order/entities/order.entity';
import { TransactionType } from './coupon.enum';

@Injectable()
export class CouponTransactionService {
  constructor(
    @InjectRepository(CouponTransaction)
    private readonly couponTransactionRepository: Repository<CouponTransaction>,
    private readonly entityManager: EntityManager,
  ) {}

  createQueryBuilder(alias: string) {
    return this.couponTransactionRepository.createQueryBuilder(alias);
  }

  async createTransaction(
    options: {
      coupon: Coupon;
      amount: number;
      type: TransactionType;
      balanceBefore: number;
      balanceAfter: number;
      processedById?: string;
      notes?: string;
      order?: Order;
    },
    manager?: EntityManager,
  ): Promise<CouponTransaction> {
    const finalManager = manager || this.entityManager;
    const transactionRepo = finalManager.getRepository(CouponTransaction);
    const userRepo = finalManager.getRepository(User);

    let processedBy: User | undefined;
    if (options.processedById) {
      processedBy = await userRepo.findOne({
        where: { id: options.processedById },
      });
    }

    const transaction = transactionRepo.create({
      ...options,
      processedBy,
    });

    return transactionRepo.save(transaction);
  }
}
