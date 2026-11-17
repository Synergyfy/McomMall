import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Product } from '../product/entities/product.entity';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { TransactionService } from '../transaction/transaction.service';
import { ApplyOfferDto } from './dto/apply-offer.dto';
import { RewardCouponType } from './offer.enum';
import { Transaction } from '../transaction/entities/transaction.entity';
import { ActivitiesService } from '../activities/activities.service';
import { TimeBonusEnrollment } from './entities/time-bonus-enrollment.entity';
import {
  PointTransaction,
  PointTransactionSource,
  PointTransactionType,
} from '../transaction/entities/point-transaction.entity';
@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TimeBonusEnrollment)
    private readonly timeBonusEnrollmentRepository: Repository<TimeBonusEnrollment>,
    @InjectRepository(PointTransaction)
    private readonly pointTransactionRepository: Repository<PointTransaction>,
    private readonly transactionService: TransactionService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(user: User, createOfferDto: CreateOfferDto): Promise<Offer> {
    const {
      includedProductIds,
      excludedProductIds,
      freeProductId,
      ...rest
    } = createOfferDto;

    const includedProducts = includedProductIds
      ? await this.productRepository.findBy({ id: In(includedProductIds) })
      : [];
    const excludedProducts = excludedProductIds
      ? await this.productRepository.findBy({ id: In(excludedProductIds) })
      : [];

    let freeProduct: Product | undefined;
    if (createOfferDto.rewardCouponType === RewardCouponType.FREE_PRODUCTS) {
      if (!freeProductId) {
        throw new BadRequestException(
          'Free product ID is required for this reward type',
        );
      }
      freeProduct = await this.productRepository.findOne({
        where: { id: freeProductId },
      });
      if (!freeProduct) {
        throw new NotFoundException(
          `Product with ID "${freeProductId}" not found`,
        );
      }
    }

    const offer = this.offerRepository.create({
      ...rest,
      user,
      includedProducts,
      excludedProducts,
      freeProduct,
    });

    const savedOffer = await this.offerRepository.save(offer);
    await this.activitiesService.create(
      user,
      'created',
      'offer',
      savedOffer.name,
    );
    return savedOffer;
  }

  findAll(userId: string): Promise<Offer[]> {
    return this.offerRepository.find({
      where: { user: { id: userId } },
    });
  }

  countForUser(userId: string): Promise<number> {
    return this.offerRepository.count({
      where: { user: { id: userId } },
    });
  }

  /**
   * Public-facing list of active rewards for a listing. Offers belong to the
   * merchant, so they are resolved through the listing owner.
   */
  async findActiveForBusiness(businessId: string): Promise<Offer[]> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });
    const ownerId = business?.user?.id;
    if (!ownerId) {
      return [];
    }

    const now = new Date();
    const offers = await this.offerRepository.find({
      where: { isActive: true, user: { id: ownerId } },
      relations: ['freeProduct'],
      order: { created_at: 'DESC' },
    });

    return offers.filter(
      (offer) =>
        !offer.isTimeBonus &&
        (!offer.beginDate || new Date(offer.beginDate) <= now) &&
        (!offer.endDate || new Date(offer.endDate) >= now),
    );
  }

  async findOne(userId: string, id: string): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user', 'includedProducts', 'excludedProducts', 'freeProduct'],
    });
    if (!offer) {
      throw new NotFoundException(`Offer with ID "${id}" not found`);
    }
    return offer;
  }

  async update(
    id: string,
    updateOfferDto: UpdateOfferDto,
    user: User,
  ): Promise<Offer> {
    const {
      freeProductId,
      includedProductIds,
      excludedProductIds,
      ...rest
    } = updateOfferDto;

    const offer = await this.offerRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: [
        'user',
        'includedProducts',
        'excludedProducts',
        'freeProduct',
      ],
    });
    if (!offer) {
      throw new NotFoundException(`Offer with ID "${id}" not found`);
    }

    Object.assign(offer, rest);

    if (includedProductIds) {
      if (includedProductIds.length > 0) {
        offer.includedProducts = await this.productRepository.findBy({
          id: In(includedProductIds),
        });
      } else {
        offer.includedProducts = [];
      }
    }

    if (excludedProductIds) {
      if (excludedProductIds.length > 0) {
        offer.excludedProducts = await this.productRepository.findBy({
          id: In(excludedProductIds),
        });
      } else {
        offer.excludedProducts = [];
      }
    }

    if (
      updateOfferDto.rewardCouponType === RewardCouponType.FREE_PRODUCTS &&
      freeProductId
    ) {
      const freeProduct = await this.productRepository.findOne({
        where: { id: freeProductId },
      });
      if (!freeProduct) {
        throw new NotFoundException(
          `Product with ID "${freeProductId}" not found`,
        );
      }
      offer.freeProduct = freeProduct;
    }

    const savedOffer = await this.offerRepository.save(offer);
    await this.activitiesService.create(
      user,
      'updated',
      'offer',
      savedOffer.name,
    );
    return savedOffer;
  }

  private timeBonusCanClaim(
    offer: Offer,
    enrollment?: TimeBonusEnrollment | null,
  ): boolean {
    const limit = offer.limitPerCustomer ?? 1;
    const claims = enrollment?.claims ?? 0;
    if (claims < limit) return true;
    if (!offer.allowLimitToReset) return false;
    if (!enrollment?.lastClaimedAt) return true;
    return (
      Date.now() - new Date(enrollment.lastClaimedAt).getTime() >=
      24 * 60 * 60 * 1000
    );
  }

  async findPublicTimeBonuses(businessId: string, userId?: string) {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });
    const ownerId = business?.user?.id;
    if (!ownerId) return [];

    const now = new Date();
    const bonuses = await this.offerRepository.find({
      where: { isActive: true, isTimeBonus: true, user: { id: ownerId } },
      order: { created_at: 'DESC' },
    });

    const active = bonuses.filter(
      (offer) =>
        (!offer.beginDate || new Date(offer.beginDate) <= now) &&
        (!offer.endDate || new Date(offer.endDate) >= now),
    );

    const enrollments = userId
      ? await this.timeBonusEnrollmentRepository.find({
          where: {
            userId,
            offerId: In(active.map((offer) => offer.id)),
          },
        })
      : [];
    const enrollmentByOffer = new Map(
      enrollments.map((enrollment) => [enrollment.offerId, enrollment]),
    );

    const isOwner = !!userId && ownerId === userId;

    return active.map((offer) => {
      const enrollment = enrollmentByOffer.get(offer.id);
      return {
        id: offer.id,
        isOwner,
        name: offer.name,
        description: offer.description ?? '',
        bonusPoints: offer.bonusPoints ?? 0,
        endDate: offer.endDate,
        limitPerCustomer: offer.limitPerCustomer ?? 1,
        allowLimitToReset: offer.allowLimitToReset ?? false,
        claims: enrollment?.claims ?? 0,
        lastClaimedAt: enrollment?.lastClaimedAt ?? null,
        canClaim: this.timeBonusCanClaim(offer, enrollment),
      };
    });
  }

  async activateTimeBonus(userId: string, offerId: string) {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: ['user'],
    });
    if (!offer || !offer.isTimeBonus) {
      throw new NotFoundException('Time bonus not found');
    }
    if (offer.user?.id === userId) {
      throw new ForbiddenException(
        'You cannot activate a time bonus from your own business.',
      );
    }
    if (!offer.isActive) {
      throw new BadRequestException('This time bonus is not active');
    }
    if (offer.beginDate && new Date(offer.beginDate) > new Date()) {
      throw new BadRequestException('This time bonus has not started yet');
    }
    if (offer.endDate && new Date(offer.endDate) < new Date()) {
      throw new BadRequestException('This time bonus has expired');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let enrollment = await this.timeBonusEnrollmentRepository.findOne({
      where: { offerId, userId },
    });
    if (!this.timeBonusCanClaim(offer, enrollment)) {
      throw new BadRequestException(
        'You have already claimed this time bonus.',
      );
    }

    if (!enrollment) {
      enrollment = this.timeBonusEnrollmentRepository.create({
        offerId,
        userId,
        claims: 0,
      });
    }

    const points = offer.bonusPoints ?? 0;
    if (points > 0) {
      const business = await this.businessRepository.findOne({
        where: { user: { id: offer.user?.id } },
      });
      user.points = (user.points ?? 0) + points;
      await this.userRepository.save(user);
      await this.pointTransactionRepository.save(
        this.pointTransactionRepository.create({
          user,
          points,
          type: PointTransactionType.EARNED,
          businessId: business?.id,
          reason: `Time bonus: ${offer.name}`,
          source: PointTransactionSource.RULE,
        }),
      );
    }

    enrollment.claims = (enrollment.claims ?? 0) + 1;
    enrollment.lastClaimedAt = new Date();
    await this.timeBonusEnrollmentRepository.save(enrollment);

    return {
      offerId: offer.id,
      pointsAwarded: points,
      claims: enrollment.claims,
      canClaim: this.timeBonusCanClaim(offer, enrollment),
    };
  }

  async remove(userId: string, id: string): Promise<void> {
    const offer = await this.findOne(userId, id);
    await this.offerRepository.remove(offer);
    await this.activitiesService.create(
      offer.user,
      'deleted',
      'offer',
      offer.name,
    );
  }

  async applyOffer(
    userId: string,
    applyOfferDto: ApplyOfferDto,
  ): Promise<{ valid: boolean; message: string; discountAmount?: number }> {
    const { offerId, productIds } = applyOfferDto;

    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: [
        'includedProducts',
        'excludedProducts',
        'user',
        'freeProduct',
      ],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (!offer.isActive) {
      throw new BadRequestException('Offer is not active');
    }

    if (offer.beginDate && new Date(offer.beginDate) > new Date()) {
      throw new BadRequestException('Offer has not started yet');
    }

    if (offer.endDate && new Date(offer.endDate) < new Date()) {
      throw new BadRequestException('Offer has expired');
    }

    if (!offer.user) {
      throw new BadRequestException('Offer creator not found');
    }
    if (offer.user.id === userId) {
      throw new ForbiddenException(
        'You cannot redeem an offer from your own business.',
      );
    }

    const customer = await this.userRepository.findOne({
      where: { id: userId },
    });
    const availablePoints = customer?.points || 0;

    if (availablePoints < offer.points) {
      throw new BadRequestException(
        'Insufficient points to redeem this offer.',
      );
    }

    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['business'],
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found');
    }

    const applicableProducts = products.filter((product) => {
      if (
        offer.includedProducts.length > 0 &&
        !offer.includedProducts.some((p) => p.id === product.id)
      ) {
        return false;
      }
      if (
        offer.excludedProducts.length > 0 &&
        offer.excludedProducts.some((p) => p.id === product.id)
      ) {
        return false;
      }
      return true;
    });

    if (applicableProducts.length === 0) {
      throw new BadRequestException(
        'This offer is not applicable to any of the products',
      );
    }

    let originalPrice = 0;
    for (const product of applicableProducts) {
      originalPrice += product.price;
    }

    let discountAmount = 0;
    switch (offer.rewardCouponType) {
      case RewardCouponType.FIXED_CART_DISCOUNT:
        discountAmount = offer.discountAmount;
        break;
      case RewardCouponType.PERCENTAGE_DISCOUNT:
        discountAmount = (originalPrice * offer.discountPercentage) / 100;
        break;
      case RewardCouponType.FREE_PRODUCTS:
        if (offer.freeProduct && productIds.includes(offer.freeProduct.id)) {
          discountAmount = offer.freeProduct.price;
        } else {
          throw new BadRequestException('Free product not in cart');
        }
        break;
      case RewardCouponType.BONUS_POINTS:
        // This is now just a validation, no points are added here
        break;
      default:
        throw new BadRequestException('Invalid reward coupon type');
    }

    return {
      valid: true,
      message: 'Offer is applicable.',
      discountAmount,
    };
  }

  async getOfferTransactions(
    userId: string,
    offerId: string,
  ): Promise<Transaction[]> {
    const offer = await this.findOne(userId, offerId);
    return offer.transactions;
  }
}
