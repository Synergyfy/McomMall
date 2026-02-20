import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
import { RewardCouponType, OfferScope } from './offer.enum';
import { Transaction } from '../transaction/entities/transaction.entity';
import { PromotionParticipant } from '../promotion/entities/promotion-participant.entity';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityTimerService } from '../activity-timer/activity-timer.service';
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
    private readonly transactionService: TransactionService,
    @InjectRepository(PromotionParticipant)
    private readonly promotionParticipantRepository: Repository<PromotionParticipant>,
    private readonly activitiesService: ActivitiesService,
    private readonly activityTimerService: ActivityTimerService,
  ) {}

  async create(user: User, createOfferDto: CreateOfferDto): Promise<Offer> {
    const {
      includedProductIds,
      excludedProductIds,
      freeProductId,
      businessIds,
      offerScope,
      ...rest
    } = createOfferDto;

    let businesses: Business[] = [];
    if (offerScope === OfferScope.SPECIFIC_LISTINGS) {
      if (!businessIds || businessIds.length === 0) {
        throw new BadRequestException(
          'Business IDs are required for specific listings scope',
        );
      }
      businesses = await this.businessRepository.find({
        where: { id: In(businessIds), user: { id: user.id } },
      });
      if (businesses.length !== businessIds.length) {
        throw new NotFoundException(
          'One or more businesses not found or do not belong to the user',
        );
      }
    }

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
      offerScope,
      user,
      businesses,
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
    await this.activityTimerService.completeTaskByKey(user.id, 'createdOffer');
    return savedOffer;
  }

  findAll(userId: string): Promise<Offer[]> {
    return this.offerRepository.find({
      where: { user: { id: userId } },
      relations: ['businesses'],
    });
  }

  async findOne(userId: string, id: string): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user', 'businesses'],
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
      businessIds,
      includedProductIds,
      excludedProductIds,
      ...rest
    } = updateOfferDto;

    const offer = await this.offerRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['user', 'businesses'],
    });
    if (!offer) {
      throw new NotFoundException(`Offer with ID "${id}" not found`);
    }

    Object.assign(offer, rest);

    if (updateOfferDto.offerScope) {
      offer.offerScope = updateOfferDto.offerScope;
    }

    if (offer.offerScope === OfferScope.SPECIFIC_LISTINGS) {
      if (businessIds) {
        if (businessIds.length > 0) {
          const businesses = await this.businessRepository.find({
            where: { id: In(businessIds), user: { id: user.id } },
          });
          if (businesses.length !== businessIds.length) {
            throw new NotFoundException(
              'One or more businesses not found or do not belong to the user',
            );
          }
          offer.businesses = businesses;
        } else {
          offer.businesses = [];
        }
      }
    } else if (
      offer.offerScope === OfferScope.ALL_LISTINGS ||
      offer.offerScope === OfferScope.SPECIFIC_PRODUCTS
    ) {
      offer.businesses = [];
    }

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

  async remove(userId: string, id: string): Promise<void> {
    const offer = await this.findOne(userId, id);
    await this.offerRepository.remove(offer);
    await this.activitiesService.create(offer.user, 'deleted', 'offer', offer.name);
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
        'businesses',
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
    const creatorId = offer.user.id;

    const userParticipations = await this.promotionParticipantRepository.find({
      where: { user: { id: userId } },
      relations: [
        'promotion',
        'promotion.businesses',
        'promotion.businesses.user',
      ],
    });

    const pointsByCreator = new Map<string, number>();
    for (const p of userParticipations) {
      if (p.promotion.businesses && p.promotion.businesses.length > 0) {
        const creator = p.promotion.businesses[0].user;
        if (creator) {
          const currentPoints = pointsByCreator.get(creator.id) || 0;
          pointsByCreator.set(creator.id, currentPoints + p.pointsEarned);
        }
      }
    }

    const creatorSpecificPoints = pointsByCreator.get(creatorId) || 0;

    if (creatorSpecificPoints < offer.points) {
      throw new BadRequestException(
        'Insufficient points from this creator to redeem this offer.',
      );
    }

    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['business'],
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found');
    }

    if (offer.offerScope === OfferScope.SPECIFIC_LISTINGS) {
      const offerBusinessIds = offer.businesses.map((b) => b.id);
      const productsAreInScope = products.every(
        (p) => p.business && offerBusinessIds.includes(p.business.id),
      );
      if (!productsAreInScope) {
        throw new BadRequestException(
          'This offer is not applicable to the businesses of the products in the cart.',
        );
      }
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
