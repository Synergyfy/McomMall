import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { Promotion } from './entities/promotion.entity';
import { PromotionParticipant } from './entities/promotion-participant.entity';
import { PromotionActivity } from './entities/promotion-activity.entity';
import { PromotionScope } from './promotion.enum';
import { Product } from '../product/entities/product.entity';
import { PointTransaction, PointTransactionType } from '../transaction/entities/point-transaction.entity';

@Injectable()
export class PromotionEngineService {
  private readonly logger = new Logger(PromotionEngineService.name);

  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(PromotionParticipant)
    private readonly promotionParticipantRepository: Repository<PromotionParticipant>,
    @InjectRepository(PromotionActivity)
    private readonly promotionActivityRepository: Repository<PromotionActivity>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async processPurchase(user: User, order: Order): Promise<void> {
    this.logger.log(
      `Starting promotion processing for user ${user.id} and order ${order.id}`,
    );

    const participations = await this.promotionParticipantRepository.find({
      where: { user: { id: user.id } },
      relations: [
        'promotion',
        'promotion.businesses',
        'promotion.includedProducts',
        'promotion.businesses.user',
      ],
    });
    this.logger.log(
      `Found ${participations.length} promotion participations for user ${user.id}`,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of order.items) {
        const product = await this.productRepository.findOne({
          where: { id: item.product.id },
          relations: ['business', 'business.user'],
        });

        if (!product) {
          this.logger.error(
            `Product with ID ${item.product.id} not found, though it was part of a successful order.`,
          );
          continue;
        }

        this.logger.log(
          `Loaded product ${product.id} with business ${product.business?.id}`,
        );

        for (const participation of participations) {
          const promotion = participation.promotion;
          this.logger.log(
            `Checking promotion ${promotion.id} (${promotion.name})`,
          );

          if (!promotion.isActive) {
            this.logger.log(`Promotion ${promotion.id} is not active.`);
            continue;
          }

          const now = new Date();
          if (promotion.beginDate && now < promotion.beginDate) {
            this.logger.log(`Promotion ${promotion.id} has not started yet.`);
            continue;
          }
          if (promotion.endDate && now > promotion.endDate) {
            this.logger.log(`Promotion ${promotion.id} has ended.`);
            continue;
          }

          if (promotion.minimumSpend > order.total) {
            this.logger.log(
              `Order amount ${order.total} is less than minimum spend ${promotion.minimumSpend} for promotion ${promotion.id}`,
            );
            continue;
          }

          if (promotion.limitPerCustomer) {
            const activityCount = await queryRunner.manager.count(
              PromotionActivity,
              {
                where: { participant: { id: participation.id } },
              },
            );
            if (activityCount >= promotion.limitPerCustomer) {
              this.logger.log(
                `User has reached the limit of ${promotion.limitPerCustomer} for promotion ${promotion.id}`,
              );
              continue;
            }
          }

          let isEligible = false;
          const productOwnerId = product.business?.user?.id;
          this.logger.log(
            `Checking scope ${promotion.promotionScope} for promotion ${promotion.id}`,
          );

          switch (promotion.promotionScope) {
            case 'ALL_LISTINGS':
              if (
                promotion.businesses?.some(
                  (b) => b.id === product.business?.id,
                )
              ) {
                isEligible = true;
                this.logger.log(
                  `Promotion ${promotion.id} is eligible (ALL_LISTINGS).`,
                );
              } else {
                 this.logger.log(
                  `Promotion ${promotion.id} not eligible (ALL_LISTINGS). Product business ${product.business?.id} not in promotion businesses.`,
                );
              }
              break;
            case 'SPECIFIC_LISTINGS':
              if (
                promotion.businesses.some((b) => b.id === product.business?.id)
              ) {
                isEligible = true;
                this.logger.log(
                  `Promotion ${
                    promotion.id
                  } is eligible (SPECIFIC_LISTINGS). Product business ID: ${
                    product.business?.id
                  }`,
                );
              } else {
                this.logger.log(
                  `Promotion ${
                    promotion.id
                  } is not eligible (SPECIFIC_LISTINGS).`,
                );
              }
              break;
            case 'ALL_PRODUCTS':
              const promotionCreatorId = promotion.businesses?.[0]?.user?.id;
              if (promotionCreatorId && productOwnerId === promotionCreatorId) {
                isEligible = true;
                this.logger.log(
                  `Promotion ${promotion.id} is eligible (ALL_PRODUCTS).`,
                );
              } else {
                this.logger.log(
                  `Promotion ${
                    promotion.id
                  } is not eligible (ALL_PRODUCTS). Product owner ID: ${productOwnerId}, Promotion creator ID: ${promotionCreatorId}`,
                );
              }
              break;
            case 'SPECIFIC_PRODUCTS':
              if (promotion.includedProducts.some((p) => p.id === product.id)) {
                isEligible = true;
                this.logger.log(
                  `Promotion ${promotion.id} is eligible (SPECIFIC_PRODUCTS).`,
                );
              } else {
                this.logger.log(
                  `Promotion ${
                    promotion.id
                  } is not eligible (SPECIFIC_PRODUCTS).`,
                );
              }
              break;
          }

          if (isEligible) {
            let pointsToAward = 0;
            if (promotion.promotionType === 'BONUS_POINTS') {
              pointsToAward = promotion.bonusPoints;
            } else if (promotion.promotionType === 'MULTIPLIER') {
              pointsToAward = item.price * item.quantity * promotion.multiplier;
            }

            if (pointsToAward > 0) {
              this.logger.log(
                `Awarding ${pointsToAward} points for promotion ${promotion.id}`,
              );

              participation.pointsEarned += pointsToAward;
              await queryRunner.manager.save(participation);

              // Update User Wallet
              user.points = (user.points || 0) + pointsToAward;
              await queryRunner.manager.save(user);

              const activity = this.promotionActivityRepository.create({
                user,
                promotion,
                participant: participation,
                pointsEarned: pointsToAward,
              });
              await queryRunner.manager.save(activity);

              // Create Point Transaction
              const transaction = new PointTransaction();
              transaction.user = user;
              transaction.points = pointsToAward;
              transaction.type = PointTransactionType.EARNED;
              transaction.promotion = promotion;
              transaction.order = order;
              await queryRunner.manager.save(transaction);
            }
          }
        }
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      this.logger.error('Error in promotion processing transaction', err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}