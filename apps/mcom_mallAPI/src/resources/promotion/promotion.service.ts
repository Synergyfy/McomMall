import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { Product } from '../product/entities/product.entity';
import { PromotionScope } from './promotion.enum';
import { Business } from '../listings/entities/listing.entity';
import { CheckPromotionDto } from './dto/check-promotion.dto';
import { PromotionParticipant } from './entities/promotion-participant.entity';
import { User } from '../users/entities/user.entity';
import { PromotionActivity } from './entities/promotion-activity.entity';
import { ActivitiesService } from '../activities/activities.service';
import {
  PointTransaction,
  PointTransactionType,
} from '../transaction/entities/point-transaction.entity';
import { PromotionSummaryStatisticsDto } from './dto/promotion-summary-statistics.dto';
import { PromotionHistoryQueryDto } from './dto/promotion-history-query.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PromotionTransactionHistoryDto } from './dto/promotion-transaction-history.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import {
  CapabilityService,
  ActionType,
} from '../capability/capability.service';
import { ActivityTimerService } from '../activity-timer/activity-timer.service';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(PromotionParticipant)
    private readonly promotionParticipantRepository: Repository<PromotionParticipant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PromotionActivity)
    private readonly promotionActivityRepository: Repository<PromotionActivity>,
    @InjectRepository(PointTransaction)
    private readonly pointTransactionRepository: Repository<PointTransaction>,
    private readonly activitiesService: ActivitiesService,
    private readonly activityTimerService: ActivityTimerService,
    @Inject(forwardRef(() => CapabilityService))
    private readonly capabilityService: CapabilityService,
  ) {}

  async create(
    userId: string,
    createPromotionDto: CreatePromotionDto,
  ): Promise<Promotion> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    const currentCount = await this.promotionRepository.count({
      where: { user: { id: userId } },
    });
    await this.capabilityService.checkPermission(
      userId,
      ActionType.CREATE_LOYALTY_PROGRAM,
      { currentCount },
    );

    const {
      includedProductIds,
      excludedProductIds,
      businessIds,
      promotionScope,
      ...rest
    } = createPromotionDto;
    const promotion = this.promotionRepository.create({
      ...rest,
      promotionScope,
      user,
    });

    if (promotionScope === PromotionScope.SPECIFIC_LISTINGS) {
      promotion.businesses = await this.businessRepository.findBy({
        id: In(businessIds),
        user: { id: userId },
      });
    } else if (promotionScope === PromotionScope.ALL_LISTINGS) {
      promotion.businesses = await this.businessRepository.findBy({
        user: { id: userId },
      });
    } else if (promotionScope === PromotionScope.ALL_PRODUCTS) {
      promotion.businesses = await this.businessRepository.find({
        where: { user: { id: userId } },
      });
    } else if (promotionScope === PromotionScope.SPECIFIC_PRODUCTS) {
      if (includedProductIds) {
        promotion.includedProducts = await this.productRepository.findBy({
          id: In(includedProductIds),
        });
      }
    }

    if (
      promotionScope !== PromotionScope.ALL_PRODUCTS &&
      promotionScope !== PromotionScope.SPECIFIC_PRODUCTS &&
      includedProductIds
    ) {
      promotion.includedProducts = await this.productRepository.findBy({
        id: In(includedProductIds),
      });
    }

    if (excludedProductIds) {
      promotion.excludedProducts = await this.productRepository.findBy({
        id: In(excludedProductIds),
      });
    }

    const savedPromotion = await this.promotionRepository.save(promotion);
    await this.activitiesService.create(
      user,
      'created',
      'promotion',
      savedPromotion.name,
    );
    await this.activityTimerService.completeTaskByKey(
      user.id,
      'createdLoyalty',
      true,
    );

    return savedPromotion;
  }

  findAll(userId: string): Promise<Promotion[]> {
    return this.promotionRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }

  async countForUser(userId: string): Promise<number> {
    return this.promotionRepository.count({ where: { user: { id: userId } } });
  }

  async findOne(userId: string, id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository
      .createQueryBuilder('promotion')
      .leftJoin('promotion.businesses', 'business')
      .where('promotion.id = :id', { id })
      .andWhere('business.userId = :userId', { userId })
      .getOne();

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID "${id}" not found`);
    }
    return promotion;
  }

  async update(
    userId: string,
    id: string,
    updatePromotionDto: UpdatePromotionDto,
  ): Promise<Promotion> {
    const {
      includedProductIds,
      excludedProductIds,
      businessIds,
      promotionScope,
      ...rest
    } = updatePromotionDto;
    const promotion = await this.findOne(userId, id);

    Object.assign(promotion, rest);

    if (promotionScope === PromotionScope.SPECIFIC_LISTINGS) {
      promotion.businesses = await this.businessRepository.findBy({
        id: In(businessIds),
        user: { id: userId },
      });
    } else if (promotionScope === PromotionScope.ALL_LISTINGS) {
      promotion.businesses = await this.businessRepository.findBy({
        user: { id: userId },
      });
    } else if (promotionScope === PromotionScope.ALL_PRODUCTS) {
      promotion.businesses = await this.businessRepository.find({
        where: { user: { id: userId } },
      });
    } else if (promotionScope === PromotionScope.SPECIFIC_PRODUCTS) {
      if (includedProductIds) {
        promotion.includedProducts = await this.productRepository.findBy({
          id: In(includedProductIds),
        });
      }
    }

    if (
      promotionScope !== PromotionScope.ALL_PRODUCTS &&
      promotionScope !== PromotionScope.SPECIFIC_PRODUCTS &&
      includedProductIds
    ) {
      promotion.includedProducts = await this.productRepository.findBy({
        id: In(includedProductIds),
      });
    }

    if (excludedProductIds) {
      promotion.excludedProducts = await this.productRepository.findBy({
        id: In(excludedProductIds),
      });
    }

    const savedPromotion = await this.promotionRepository.save(promotion);
    await this.activitiesService.create(
      promotion.user,
      'updated',
      'promotion',
      savedPromotion.name,
    );
    return savedPromotion;
  }

  async findUserPromotions(userId: string): Promise<Promotion[]> {
    return this.promotionRepository
      .createQueryBuilder('promotion')
      .innerJoin('promotion.participants', 'participant')
      .leftJoinAndSelect('promotion.businesses', 'businesses')
      .leftJoinAndSelect('promotion.includedProducts', 'includedProducts')
      .leftJoinAndSelect('promotion.excludedProducts', 'excludedProducts')
      .leftJoinAndSelect('promotion.user', 'user')
      .where('participant.userId = :userId', { userId })
      .getMany();
  }

  async remove(userId: string, id: string): Promise<void> {
    const promotion = await this.findOne(userId, id);
    await this.promotionRepository.remove(promotion);
    await this.activitiesService.create(
      promotion.user,
      'deleted',
      'promotion',
      promotion.name,
    );
  }

  async check(
    checkPromotionDto: CheckPromotionDto,
    userId?: string,
  ): Promise<(Promotion & { isParticipating: boolean })[]> {
    const { businessId, productId } = checkPromotionDto;

    if (!businessId && !productId) {
      throw new BadRequestException(
        'Either businessId or productId must be provided.',
      );
    }

    const qb = this.promotionRepository
      .createQueryBuilder('promotion')
      .where('promotion.isActive = :isActive', { isActive: true })
      .andWhere('(promotion.endDate IS NULL OR promotion.endDate > :now)', {
        now: new Date(),
      });

    const orConditions = [
      'promotion.promotionScope = :allListings',
      'promotion.promotionScope = :allProducts',
    ];

    const params: any = {
      allListings: PromotionScope.ALL_LISTINGS,
      allProducts: PromotionScope.ALL_PRODUCTS,
    };

    if (businessId) {
      orConditions.push('business.id = :businessId');
      params.businessId = businessId;
      qb.leftJoin('promotion.businesses', 'business');
    }

    if (productId) {
      orConditions.push('includedProduct.id = :productId');
      orConditions.push('businessProduct.id = :productId');
      params.productId = productId;
      qb.leftJoin('promotion.includedProducts', 'includedProduct')
        .leftJoin('promotion.businesses', 'pBusiness')
        .leftJoin('pBusiness.products', 'businessProduct');
    }

    qb.andWhere(`(${orConditions.join(' OR ')})`, params);

    const promotions = await qb.getMany();

    if (promotions.length === 0) {
      return [];
    }

    if (!userId) {
      return promotions.map((p) => ({ ...p, isParticipating: false }));
    }

    const participations = await this.promotionParticipantRepository.find({
      where: {
        user: { id: userId },
        promotion: { id: In(promotions.map((p) => p.id)) },
      },
      relations: ['promotion'],
    });

    const participationMap = new Set(participations.map((p) => p.promotion.id));

    return promotions.map((p) => ({
      ...p,
      isParticipating: participationMap.has(p.id),
    }));
  }

  async participate(
    userId: string,
    promotionId: string,
  ): Promise<PromotionParticipant> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    const promotion = await this.promotionRepository.findOne({
      where: { id: promotionId },
    });
    if (!promotion) {
      throw new NotFoundException(
        `Promotion with ID "${promotionId}" not found`,
      );
    }

    if (!promotion.isActive) {
      throw new BadRequestException('This promotion is not active.');
    }

    const now = new Date();
    if (promotion.beginDate && now < promotion.beginDate) {
      throw new BadRequestException('This promotion has not started yet.');
    }

    if (promotion.endDate && now > promotion.endDate) {
      throw new BadRequestException('This promotion has ended.');
    }

    const existingParticipation =
      await this.promotionParticipantRepository.findOne({
        where: {
          user: { id: userId },
          promotion: { id: promotionId },
        },
      });

    if (existingParticipation) {
      throw new BadRequestException(
        'You are already participating in this promotion.',
      );
    }

    const participant = this.promotionParticipantRepository.create({
      user,
      promotion,
    });

    return this.promotionParticipantRepository.save(participant);
  }

  async findAllParticipantsForOwner(
    ownerId: string,
  ): Promise<PromotionParticipant[]> {
    const participants = await this.promotionParticipantRepository
      .createQueryBuilder('participant')
      .innerJoinAndSelect('participant.user', 'user')
      .innerJoinAndSelect('participant.promotion', 'promotion')
      .innerJoin('promotion.businesses', 'business')
      .where('business.userId = :ownerId', { ownerId })
      .getMany();

    return participants;
  }

  async updatePoints(
    ownerId: string,
    participantId: string,
    amount: number,
  ): Promise<PromotionParticipant> {
    const participant = await this.promotionParticipantRepository.findOne({
      where: { id: participantId },
      relations: [
        'promotion',
        'promotion.businesses',
        'user',
        'promotion.businesses.user',
      ],
    });

    if (!participant) {
      throw new NotFoundException(
        `Promotion participant with ID "${participantId}" not found`,
      );
    }

    const isOwner = participant.promotion.businesses.some(
      (b) => b.user?.id === ownerId,
    );

    console.log('Is owner:', isOwner);

    if (!isOwner) {
      throw new ForbiddenException(
        'You are not authorized to modify this participant.',
      );
    }

    const newPoints = participant.pointsEarned + amount;
    if (newPoints < 0) {
      throw new BadRequestException('Points cannot be negative.');
    }

    participant.pointsEarned = newPoints;
    participant.user.points = (participant.user.points || 0) + amount;
    await this.promotionParticipantRepository.save(participant);
    await this.userRepository.save(participant.user);

    const activity = this.promotionActivityRepository.create({
      user: participant.user,
      promotion: participant.promotion,
      participant: participant,
      pointsEarned: amount,
    });
    await this.promotionActivityRepository.save(activity);

    return participant;
  }

  async getPromotionStatsForUser(
    userId: string,
  ): Promise<{ promotionPoints: number; promotionsParticipating: number }> {
    const stats = await this.promotionParticipantRepository
      .createQueryBuilder('participant')
      .select('SUM(participant.pointsEarned)', 'promotionPoints')
      .addSelect('COUNT(participant.id)', 'promotionsParticipating')
      .where('participant.userId = :userId', { userId })
      .getRawOne();

    const promotionPoints = parseInt(stats.promotionPoints) || 0;
    const promotionsParticipating =
      parseInt(stats.promotionsParticipating) || 0;

    return { promotionPoints, promotionsParticipating };
  }

  async getSummaryStatistics(
    promotionId: string,
  ): Promise<PromotionSummaryStatisticsDto> {
    const promotion = await this.promotionRepository.findOne({
      where: { id: promotionId },
    });
    if (!promotion) {
      throw new NotFoundException(
        `Promotion with ID "${promotionId}" not found`,
      );
    }

    const earnedPointsQuery = this.promotionParticipantRepository
      .createQueryBuilder('participant')
      .select('SUM(participant.pointsEarned)', 'total')
      .where('participant.promotion.id = :promotionId', { promotionId });

    const redeemedPointsQuery = this.pointTransactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.points)', 'total')
      .where('transaction.promotionId = :promotionId', { promotionId })
      .andWhere('transaction.type = :type', {
        type: PointTransactionType.REDEMPTION,
      });

    const participantsQuery = this.promotionParticipantRepository
      .createQueryBuilder('participant')
      .select('COUNT(participant.id)', 'total')
      .where('participant.promotion.id = :promotionId', { promotionId });

    const [earned, redeemed, participants] = await Promise.all([
      earnedPointsQuery.getRawOne(),
      redeemedPointsQuery.getRawOne(),
      participantsQuery.getRawOne(),
    ]);

    return {
      totalPointsEarned: parseFloat(earned.total) || 0,
      totalPointsRedeemed: parseFloat(redeemed.total) || 0,
      totalParticipants: parseInt(participants.total) || 0,
    };
  }

  async getTransactionHistory(
    promotionId: string,
    query: PromotionHistoryQueryDto,
  ): Promise<PageDto<PromotionTransactionHistoryDto>> {
    const promotion = await this.promotionRepository.findOne({
      where: { id: promotionId },
    });
    if (!promotion) {
      throw new NotFoundException(
        `Promotion with ID "${promotionId}" not found`,
      );
    }

    const qb = this.pointTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .where('transaction.promotionId = :promotionId', { promotionId })
      .orderBy('transaction.created_at', query.order)
      .skip(query.skip)
      .take(query.take);

    if (query.startDate) {
      qb.andWhere('transaction.created_at >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      qb.andWhere('transaction.created_at <= :endDate', {
        endDate: query.endDate,
      });
    }

    const [transactions, total] = await qb.getManyAndCount();

    const history = transactions.map((t) => ({
      id: t.id,
      points: t.points,
      type: t.type,
      createdAt: t.created_at,
      customer: {
        id: t.user.id,
        name: t.user.name,
        email: t.user.email,
      },
    }));

    const pageMeta = new PageMetaDto({
      pageOptionsDto: query,
      itemCount: transactions.length,
      totalItems: total,
    });

    return new PageDto(history, pageMeta);
  }

  isProductQualified(
    product: Product,
    promotion: Promotion,
    business: Business,
  ): boolean {
    if (
      promotion.excludedProducts &&
      promotion.excludedProducts.some(
        (excludedProduct) => excludedProduct.id === product.id,
      )
    ) {
      return false;
    }

    switch (promotion.promotionScope) {
      case PromotionScope.ALL_LISTINGS:
        return (
          business.user?.id &&
          promotion.user?.id &&
          business.user.id === promotion.user.id
        );
      case PromotionScope.SPECIFIC_LISTINGS:
        return (
          promotion.businesses &&
          promotion.businesses.some(
            (promoBusiness) => promoBusiness.id === business.id,
          )
        );
      case PromotionScope.ALL_PRODUCTS:
        return (
          business.user?.id &&
          promotion.user?.id &&
          business.user.id === promotion.user.id
        );
      case PromotionScope.SPECIFIC_PRODUCTS:
        return (
          promotion.includedProducts &&
          promotion.includedProducts.some(
            (includedProduct) => includedProduct.id === product.id,
          )
        );
      default:
        return false;
    }
  }
}
