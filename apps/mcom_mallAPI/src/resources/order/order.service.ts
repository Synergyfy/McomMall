import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { CouponService } from '../coupon/coupon.service';
import { Order } from './entities/order.entity';
import { User } from '../users/entities/user.entity';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { OrderPayment } from './entities/order-payment.entity';
import { Product } from '../product/entities/product.entity';
import { PromotionEngineService } from '../promotion/promotion-engine.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/notification.enum';
import { OrderItem } from './entities/order-item.entity';
import { SalesStatsDto } from './dto/sales-stats.dto';
import { PointsService } from '../transaction/points.service';
import { Offer } from '../offer/entities/offer.entity';
import { GiftCardService } from '../gift-card/gift-card.service';
import { RedeemGiftCardDto } from '../gift-card/dto/redeem-gift-card.dto';
import { Business } from '../listings/entities/listing.entity';
import { VoucherService } from '../voucher/voucher.service';
import { VoucherStatus } from '../voucher/entities/voucher.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { CouponStatus } from '../coupon/coupon.enum';
import { BookingService } from '../booking/booking.service';
import { PartnershipService } from '../partnership/partnership.service';
import { ProductServiceBooking } from './entities/product-service-booking.entity';
import { Partnership } from '../partnership/entities/partnership.entity';
import { WalletService } from '../wallet/wallet.service';
import { WalletTransactionType } from '../wallet/entities/wallet-transaction.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductService } from '../product/product.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PageDto } from '../../common/dto/page.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderPayment)
    private readonly orderPaymentRepository: Repository<OrderPayment>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(ProductServiceBooking)
    private readonly productServiceBookingRepository: Repository<ProductServiceBooking>,
    @InjectRepository(Partnership)
    private readonly partnershipRepository: Repository<Partnership>,
    private readonly cartService: CartService,
    @Inject(forwardRef(() => CouponService))
    private readonly couponService: CouponService,
    @Inject(forwardRef(() => GiftCardService))
    private readonly giftCardService: GiftCardService,
    @Inject(forwardRef(() => VoucherService))
    private readonly voucherService: VoucherService,
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
    @Inject(forwardRef(() => PartnershipService))
    private readonly partnershipService: PartnershipService,
    private readonly promotionEngineService: PromotionEngineService,
    private readonly pointsService: PointsService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    private readonly entityManager: EntityManager,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
  ) { }

  // Method is not used in checkout, but keeping it for other potential uses.
  async createOrder(
    createOrderDto: any, // Keeping 'any' as this method is not the focus
    userId: string,
  ): Promise<Order> {
    // ... implementation from before
    return new Order();
  }

  async checkout(
    userId: string,
    createCheckoutDto: CreateCheckoutDto,
  ): Promise<Order> {
    const { directPurchase, giftCardPurchases, serviceBookings } =
      createCheckoutDto;
    const cart = await this.cartService.getCart(userId);

    const isCartCheckout = !directPurchase && cart && cart.items.length > 0;
    const isDirectPurchase = !!directPurchase;
    const hasGiftCardPurchases =
      giftCardPurchases && giftCardPurchases.length > 0;

    if (!isCartCheckout && !isDirectPurchase && !hasGiftCardPurchases) {
      throw new BadRequestException('Checkout is empty. Please add items to your cart, specify a direct purchase, or purchase a gift card.');
    }
    if (isCartCheckout && isDirectPurchase) {
      throw new BadRequestException('Cannot process a cart checkout and a direct purchase in the same transaction.');
    }

    let productTotal = 0;
    let productIds: string[] = [];
    const earningsPerOwner: Map<string, number> = new Map();
    let businessContextId: string | null = null;
    let directPurchaseProduct: Product | null = null;

    if (isDirectPurchase) {
      const product = await this.productRepository.findOne({
        where: { id: directPurchase.productId },
        relations: ['business', 'business.user'],
      });
      if (!product) {
        throw new NotFoundException(`Product with ID "${directPurchase.productId}" not found.`);
      }
      directPurchaseProduct = product;
      businessContextId = product.business.id;
      const ownerId = product.business.user.id;

      const price = this.productService.calculatePrice(product, directPurchase.variant || {});
      productTotal = price * directPurchase.quantity;

      productIds.push(product.id);
      earningsPerOwner.set(ownerId, (earningsPerOwner.get(ownerId) || 0) + productTotal);
    } else if (isCartCheckout) {
      // Determine context from first cart item for legacy reasons (e.g. gift card redemption logic)
      businessContextId = cart.items[0].product.businessId;

      for (const item of cart.items) {
        const price = this.productService.calculatePrice(item.product, item.selectedVariants || {});
        const itemTotal = price * item.quantity;
        const ownerId = item.product.business.user.id;

        productTotal += itemTotal;
        productIds.push(item.product.id);
        earningsPerOwner.set(ownerId, (earningsPerOwner.get(ownerId) || 0) + itemTotal);
      }
    }

    if (serviceBookings && serviceBookings.length > 0) {
      if (!isDirectPurchase) {
        throw new BadRequestException('Partnered services can only be booked with a direct product purchase.');
      }
      const partneredServices = await this.partnershipService.getProductPartnerships(directPurchase.productId);
      const partneredServiceIds = partneredServices.map(s => s.id);
      for (const bookingDetail of serviceBookings) {
        if (!partneredServiceIds.includes(bookingDetail.serviceId)) {
          throw new BadRequestException(`Service with ID ${bookingDetail.serviceId} is not partnered with the specified product.`);
        }
      }
    }

    let giftCardPurchaseTotal = 0;
    if (hasGiftCardPurchases) {
      for (const gcPurchase of giftCardPurchases) {
        const business = await this.businessRepository.findOne({ where: { id: gcPurchase.businessId }, relations: ['user'] });
        const purchaseOwnerId = business.user.id;

        if (!businessContextId) {
          businessContextId = gcPurchase.businessId;
        }

        giftCardPurchaseTotal += gcPurchase.amount;
        // Gift card purchases are also earnings for the owner
        earningsPerOwner.set(purchaseOwnerId, (earningsPerOwner.get(purchaseOwnerId) || 0) + gcPurchase.amount);
      }
    }

    const totalBeforeRedemption = productTotal + giftCardPurchaseTotal;

    let couponAmountToApply = 0;
    if (createCheckoutDto.couponCode) {
      try {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const coupon = await this.couponService.validateCoupon(createCheckoutDto.couponCode, user);

        if (coupon.discountType === 'fixed' as any) { // Type check if needed
          couponAmountToApply = Math.min(totalBeforeRedemption, Number(coupon.discountValue));
        } else {
          couponAmountToApply = totalBeforeRedemption * (Number(coupon.discountValue) / 100);
        }
      } catch (error) {
        throw new BadRequestException(`Invalid coupon: ${error.message}`);
      }
    }

    const totalAfterDiscounts = totalBeforeRedemption - couponAmountToApply;

    let giftCardAmountToApply = 0;
    if (createCheckoutDto.giftCardCode) {
      try {
        const balance = await this.giftCardService.checkBalance(createCheckoutDto.giftCardCode);
        if (createCheckoutDto.giftCardAmount) {
          if (createCheckoutDto.giftCardAmount > balance.currentBalance) {
            throw new BadRequestException('Gift card amount exceeds balance.');
          }
          giftCardAmountToApply = Math.min(totalAfterDiscounts, createCheckoutDto.giftCardAmount);
        } else {
          giftCardAmountToApply = Math.min(totalAfterDiscounts, balance.currentBalance);
        }
      } catch (error) {
        throw new BadRequestException(`Invalid or expired gift card: ${error.message}`);
      }
    }

    const totalAfterGiftCard = totalAfterDiscounts - giftCardAmountToApply;

    let voucherAmountToApply = 0;
    if (createCheckoutDto.voucherCode) {
      try {
        const voucher = await this.voucherService.findVoucherByCode(createCheckoutDto.voucherCode);
        if (voucher.status === VoucherStatus.REDEEMED || voucher.status === VoucherStatus.DISABLED || (voucher.expiresAt && new Date() > voucher.expiresAt)) {
          throw new BadRequestException('Voucher is invalid or expired.');
        }
        if (createCheckoutDto.voucherAmount) {
          if (createCheckoutDto.voucherAmount > voucher.balance) {
            throw new BadRequestException('Voucher amount exceeds balance.');
          }
          voucherAmountToApply = Math.min(totalAfterGiftCard, createCheckoutDto.voucherAmount);
        } else {
          voucherAmountToApply = Math.min(totalAfterGiftCard, voucher.balance);
        }
      } catch (error) {
        throw new BadRequestException(`Invalid voucher: ${error.message}`);
      }
    }

    const finalAmount = totalAfterGiftCard - voucherAmountToApply;

    if (createCheckoutDto.payment.amount.toFixed(2) !== finalAmount.toFixed(2)) {
      throw new BadRequestException(`The provided payment amount (${createCheckoutDto.payment.amount}) does not match the final total (${finalAmount}).`);
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    let offer: Offer | null = null;
    if (createCheckoutDto.offerId) {
      offer = await this.offerRepository.findOneBy({ id: createCheckoutDto.offerId });
      if (!offer) throw new NotFoundException('Offer not found');
    }

    return this.entityManager.transaction(async (manager) => {
      const orderPayment = manager.create(OrderPayment, { ...createCheckoutDto.payment, user, amount: finalAmount, currency: 'gbp' });
      const savedPayment = await manager.save(orderPayment);

      const orderData: Partial<Order> = { user, items: [], total: finalAmount, payment: savedPayment };
      if (offer) {
        orderData.appliedOffer = offer;
        orderData.pointsUsedToRedeem = offer.points;
      }
      const savedOrder = await manager.save(Order, orderData);

      if (createCheckoutDto.giftCardCode && giftCardAmountToApply > 0) {
        await this.giftCardService.redeem({ code: createCheckoutDto.giftCardCode, amount: giftCardAmountToApply }, savedOrder, businessContextId || undefined, manager);
      }

      if (createCheckoutDto.voucherCode && voucherAmountToApply > 0) {
        await this.voucherService.redeemForOrder({ code: createCheckoutDto.voucherCode, amount: voucherAmountToApply }, savedOrder, manager);
      }

      if (createCheckoutDto.couponCode && couponAmountToApply > 0) {
        await this.couponService.redeemForOrder({ code: createCheckoutDto.couponCode, amount: couponAmountToApply }, savedOrder, manager);
      }

      // Process product items
      if (isDirectPurchase) {
        const orderItem = manager.create(OrderItem, {
          order: savedOrder,
          product: directPurchaseProduct,
          quantity: directPurchase.quantity,
          price: directPurchaseProduct.price,
        });
        await manager.save(orderItem);
        savedOrder.items.push(orderItem);
      } else if (isCartCheckout) {
        for (const cartItem of cart.items) {
          const orderItem = manager.create(OrderItem, {
            order: savedOrder,
            product: cartItem.product,
            quantity: cartItem.quantity,
            price: cartItem.product.price,
          });
          await manager.save(orderItem);
          savedOrder.items.push(orderItem);
        }
      }

      // Process service bookings
      if (serviceBookings && serviceBookings.length > 0) {
        if (!directPurchaseProduct) {
          // This should ideally not be reached due to earlier checks
          throw new BadRequestException("A product must be directly purchased to book partnered services.");
        }
        for (const bookingDetail of serviceBookings) {
          const serviceBooking = await this.bookingService.createBookingForOrder(
            {
              serviceId: bookingDetail.serviceId,
              startTime: bookingDetail.startTime,
              endTime: bookingDetail.endTime,
            },
            userId,
            manager,
          );

          const partnership = await this.partnershipRepository.findOne({
            where: [
              {
                baseProduct: { id: directPurchaseProduct.id },
                plusService: { id: bookingDetail.serviceId },
                isActive: true,
              },
              {
                plusProduct: { id: directPurchaseProduct.id },
                baseService: { id: bookingDetail.serviceId },
                isActive: true,
              },
            ],
          });
          if (!partnership) {
            // This check is a safeguard; the earlier validation should prevent this.
            throw new BadRequestException(`Could not find an active partnership for product ${directPurchaseProduct.id} and service ${bookingDetail.serviceId}.`);
          }

          const productServiceBooking = this.productServiceBookingRepository.create({
            order: savedOrder,
            serviceBooking,
            product: directPurchaseProduct,
            partnership,
          });
          await manager.save(productServiceBooking);
        }
      }

      // Process new gift card purchases
      if (hasGiftCardPurchases) {
        for (const gcPurchase of giftCardPurchases) {
          const businessForPurchase = await this.businessRepository.findOne({ where: { id: gcPurchase.businessId }, relations: ['user'] });
          await this.giftCardService.purchaseGiftCard(gcPurchase, businessForPurchase, savedOrder);
        }
      }

      if (offer) {
        await this.pointsService.redeemPointsForOrder(savedOrder, user, offer, manager);
      }

      if (isDirectPurchase || isCartCheckout) {
        await this.promotionEngineService.processPurchase(user, savedOrder);
      }

      if (isCartCheckout) {
        await this.cartService.clearCart(userId);
      }

      // Credit earnings to all business owners involved in the order
      for (const [ownerId, amount] of earningsPerOwner.entries()) {
        if (amount > 0) {
          await this.walletService.creditEarning({
            userId: ownerId,
            amount: amount,
            type: WalletTransactionType.EARNING_ORDER,
            description: `Earnings from order #${savedOrder.id}`,
          });
        }
      }

      this.eventEmitter.emit('ORDER_PAID', {
        orderId: savedOrder.id,
      });

      return savedOrder;
    });
  }

  // ... (other methods remain the same)
  async getOrdersForCustomer(customerId: string, pagination: PaginationQueryDto): Promise<PageDto<Order>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.orderRepository.findAndCount({
      where: { user: { id: customerId } },
      relations: ['items', 'items.product'],
      skip,
      take: limit,
      order: { created_at: 'DESC' }
    });

    const pageMetaDto = new PageMetaDto({
      itemCount: items.length,
      totalItems: total,
      pageOptionsDto: pagination as any,
    });

    return new PageDto(items, pageMetaDto);
  }

  async getOrdersForOwner(ownerId: string, pagination: PaginationQueryDto): Promise<PageDto<Order>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'customer')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoin('product.business', 'business')
      .leftJoin('business.user', 'user')
      .where('user.id = :ownerId', { ownerId })
      .orderBy('order.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      itemCount: items.length,
      totalItems: total,
      pageOptionsDto: pagination as any,
    });

    return new PageDto(items, pageMetaDto);
  }

  async getSalesStatsForOwner(ownerId: string): Promise<SalesStatsDto> {
    const stats = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.items', 'item')
      .leftJoin('item.product', 'product')
      .leftJoin('product.business', 'business')
      .leftJoin('business.user', 'user')
      .select('SUM(order.total)', 'totalSales')
      .addSelect('COUNT(DISTINCT order.id)', 'orders')
      .addSelect('SUM(item.quantity)', 'productsSold')
      .where('user.id = :ownerId', { ownerId })
      .getRawOne();

    const totalSales = parseFloat(stats.totalSales) || 0;
    const productsSold = parseInt(stats.productsSold) || 0;
    const orderCount = parseInt(stats.orders) || 0;

    const commissionRate = this.configService.get<number>('commission.rate');
    const netSales = totalSales * commissionRate;
    const grossSales = totalSales;
    const totalEarnings = netSales;
    const balance = totalEarnings;

    return {
      totalSales,
      netSales,
      orders: orderCount,
      productsSold,
      totalEarnings,
      grossSales,
      balance,
    };
  }

  async getSalesStatsForCustomer(
    customerId: string,
  ): Promise<{ totalOrders: number; totalSpent: number }> {
    const stats = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'totalSpent')
      .addSelect('COUNT(order.id)', 'totalOrders')
      .where('order.userId = :customerId', { customerId })
      .getRawOne();

    const totalOrders = parseInt(stats.totalOrders) || 0;
    const totalSpent = parseFloat(stats.totalSpent) || 0;

    return { totalOrders, totalSpent };
  }
}