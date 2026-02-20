import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { In, Repository, DataSource } from 'typeorm';
import { Offer } from '../offer/entities/offer.entity';
import { OfferScope } from '../offer/offer.enum';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/product.service';
import { ApplicableOffersDto } from './dto/applicable-offers.dto';
import { PromotionParticipant } from '../promotion/entities/promotion-participant.entity';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { GiftCardService } from '../gift-card/gift-card.service';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { OrderStatus } from '../order/enums/order-status.enum';
import { CompleteCheckoutDto } from './dto/complete-checkout.dto';
import { RedeemGiftCardDto } from '../gift-card/dto/redeem-gift-card.dto';
import { CouponService } from '../coupon/coupon.service';
import { DiscountType } from '../coupon/coupon.enum';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(PromotionParticipant)
    private readonly promotionParticipantRepository: Repository<PromotionParticipant>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly giftCardService: GiftCardService,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly dataSource: DataSource,
    private readonly productService: ProductService,
    private readonly couponService: CouponService,
  ) {}

  async initiateCheckout(userId: string, createCheckoutDto: CreateCheckoutDto) {
    const { items, giftCardCode, couponCode } = createCheckoutDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const productIds = items.map((item) => item.productId);
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['business', 'business.user'],
    });

    // Ensure all products exist
    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found.');
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItems: OrderItem[] = [];
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      const unitPrice = this.productService.calculatePrice(
        product,
        item.selectedVariants,
      );
      subtotal += unitPrice * item.quantity;
      orderItems.push(
        this.orderItemRepository.create({
          product,
          quantity: item.quantity,
          price: unitPrice,
          selectedVariants: item.selectedVariants,
        }),
      );
    }

    // Apply Coupon if provided
    let couponDiscount = 0;
    if (couponCode) {
        const coupon = await this.couponService.validateCoupon(couponCode, user);
        if (coupon.discountType === DiscountType.FIXED) {
            couponDiscount = Math.min(subtotal, Number(coupon.discountValue));
        } else {
            couponDiscount = subtotal * (Number(coupon.discountValue) / 100);
        }
    }

    const totalAfterCoupon = Math.max(0, subtotal - couponDiscount);

    // Apply gift card if provided
    let giftCardAmountToApply = 0;
    if (giftCardCode) {
      const balanceResponse = await this.giftCardService.checkBalance(
        giftCardCode,
      );
      giftCardAmountToApply = Math.min(totalAfterCoupon, balanceResponse.currentBalance);
    }

    const remainingTotal = totalAfterCoupon - giftCardAmountToApply;

    // Create pending order in a transaction
    const newOrder = await this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);

      const order = orderRepo.create({
        user: { id: userId } as User,
        total: subtotal,
        items: [],
        status: OrderStatus.PENDING,
        giftCardAmountApplied: giftCardAmountToApply,
        giftCardCode: giftCardAmountToApply > 0 ? giftCardCode : null,
        couponCode: couponDiscount > 0 ? couponCode : null,
        couponDiscountApplied: couponDiscount,
      });
      const savedOrder = await orderRepo.save(order);

      for (const item of orderItems) {
        item.order = savedOrder;
        await orderItemRepo.save(item);
      }
      return savedOrder;
    });

    // Create payment intent if needed
    if (remainingTotal > 0) {
      const paymentIntent =
        await this.paymentProviderService.createStripePaymentIntent(
          remainingTotal,
          'GBP',
        );
      return {
        orderId: newOrder.id,
        clientSecret: paymentIntent.client_secret,
        paymentRequired: true,
        remainingTotal,
      };
    }

    // No payment needed, can complete immediately
    return {
      orderId: newOrder.id,
      paymentRequired: false,
      remainingTotal: 0,
    };
  }

  async completeCheckout(
    userId: string,
    completeCheckoutDto: CompleteCheckoutDto,
  ) {
    const { orderId, transactionId, paymentProvider } = completeCheckoutDto;
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId }, status: OrderStatus.PENDING },
    });

    if (!order) {
      throw new NotFoundException('Pending order not found.');
    }

    const remainingTotal = order.total - (order.giftCardAmountApplied || 0) - (order.couponDiscountApplied || 0);

    // Verify payment if one was made
    if (remainingTotal > 0) {
      if (!transactionId || !paymentProvider) {
        throw new BadRequestException(
          'Payment details are required for this order.',
        );
      }
      const verification =
        await this.paymentProviderService.verifyStripePaymentIntent(
          transactionId,
          remainingTotal,
          'GBP',
        );
      if (!verification.ok) {
        order.status = OrderStatus.FAILED;
        await this.orderRepository.save(order);
        throw new BadRequestException(
          `Payment verification failed: ${verification.reason}`,
        );
      }
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);

      // Redeem gift card
      if (order.giftCardCode && order.giftCardAmountApplied > 0) {
        const redeemDto: RedeemGiftCardDto = {
          code: order.giftCardCode,
          amount: order.giftCardAmountApplied,
        };

        // Fetch order items to get a potential business ID for non-system gift cards
        const orderWithItems = await orderRepo.findOne({
          where: { id: order.id },
          relations: ['items', 'items.product', 'items.product.business'],
        });

        const businessId = orderWithItems.items?.length > 0 ? orderWithItems.items[0].product.business.id : undefined;
        await this.giftCardService.redeem(redeemDto, order, businessId, manager);
      }

      // Redeem Coupon
      if (order.couponCode && order.couponDiscountApplied > 0) {
          await this.couponService.redeem(order.couponCode, user, order);
      }

      order.status = OrderStatus.COMPLETED;
      return await orderRepo.save(order);
    });
  }

  async getApplicableOffers(
    userId: string,
    applicableOffersDto: ApplicableOffersDto,
  ) {
    const { productIds } = applicableOffersDto;

    // 1. Get user's promotion participations and calculate points per creator
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
          const creatorId = creator.id;
          const currentPoints = pointsByCreator.get(creatorId) || 0;
          pointsByCreator.set(creatorId, currentPoints + p.pointsEarned);
        }
      }
    }

    // 2. Fetch products
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['business', 'business.user'],
    });

    // 3. Fetch all active offers from the owners of the products in the cart
    const productOwnerIds = [
      ...new Set(products.map((p) => p.business.user.id)),
    ];

    const offers = await this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.user', 'creator')
      .leftJoinAndSelect('offer.businesses', 'businesses')
      .leftJoinAndSelect('offer.includedProducts', 'includedProducts')
      .leftJoinAndSelect('offer.excludedProducts', 'excludedProducts')
      .where('offer.isActive = :isActive', { isActive: true })
      .andWhere('creator.id IN (:...productOwnerIds)', { productOwnerIds })
      .getMany();

    // 4. Filter offers in-memory and format response
    const applicableOffers = offers
      .filter((offer) => {
        // Filter by user points
        if (!offer.user) return false;
        const creatorId = offer.user.id;
        const creatorSpecificPoints = pointsByCreator.get(creatorId) || 0;
        return offer.points <= creatorSpecificPoints;
      })
      .map((offer) => {
        const applicableProductIds = products
          .filter((product) => {
            // Rule 0: Product must belong to the offer creator.
            if (product.business?.user?.id !== offer.user?.id) {
              return false;
            }

            // Rule 1: Product must NOT be in the exclusion list.
            if (offer.excludedProducts.some((p) => p.id === product.id)) {
              return false;
            }

            // Rule 2: Scope-based inclusion.
            switch (offer.offerScope) {
              case OfferScope.SPECIFIC_PRODUCTS:
                // Must be in the included list.
                return offer.includedProducts.some((p) => p.id === product.id);

              case OfferScope.SPECIFIC_LISTINGS:
                // Must belong to one of the businesses.
                const offerBusinessIds = offer.businesses.map((b) => b.id);
                if (
                  !product.business ||
                  !offerBusinessIds.includes(product.business.id)
                ) {
                  return false;
                }
                // If there's an additional includedProducts filter, it must be met.
                if (
                  offer.includedProducts.length > 0 &&
                  !offer.includedProducts.some((p) => p.id === product.id)
                ) {
                  return false;
                }
                return true;

              case OfferScope.ALL_LISTINGS:
                // If there's an includedProducts filter, it must be met.
                if (
                  offer.includedProducts.length > 0 &&
                  !offer.includedProducts.some((p) => p.id === product.id)
                ) {
                  return false;
                }
                return true;

              default:
                return false;
            }
          })
          .map((p) => p.id);

        if (applicableProductIds.length > 0) {
          return {
            offerId: offer.id,
            offerName: offer.name,
            pointsCost: offer.points,
            applicableProductIds,
          };
        }
        return null;
      })
      .filter((offer) => offer !== null);

    return applicableOffers;
  }
}
