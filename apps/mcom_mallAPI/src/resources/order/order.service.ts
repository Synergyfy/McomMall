import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Inject,
  forwardRef,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { CouponService } from '../coupon/coupon.service';
import { Order } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';
import { User } from '../users/entities/user.entity';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { OrderPayment, PaymentMethod } from './entities/order-payment.entity';
import { Product } from '../product/entities/product.entity';
import { NotificationService } from '../notification/notification.service';
import { OrderItem } from './entities/order-item.entity';
import {
  OrderItemReward,
  RewardRedemptionStatus,
  RewardTargetType,
} from './entities/order-item-reward.entity';
import { RewardOutboxOperation } from './entities/reward-redemption-outbox.entity';
import { RewardsIntegrationService } from '../rewards-integration/rewards-integration.service';
import { RewardsClientService } from '../rewards-integration/rewards-client.service';
import { EligibilityLine } from '../rewards-integration/interfaces/reward-issuance.interface';
import { RewardRedemptionReconcileService } from './reward-redemption-reconcile.service';
import { SalesStatsDto } from './dto/sales-stats.dto';
import { PointsService } from '../transaction/points.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { Offer } from '../offer/entities/offer.entity';
import { RewardCouponType } from '../offer/offer.enum';
import { GiftCardService } from '../gift-card/gift-card.service';
import {
  GiftCard,
  GiftCardDeliveryStatus,
} from '../gift-card/entities/gift-card.entity';
import { Business } from '../listings/entities/listing.entity';
import { BusinessStatus } from '../listings/listing.enum';
import { VoucherService } from '../voucher/voucher.service';
import { MoneyEngineService } from '../money-engine/money-engine.service';
import { FunctionalType } from '../money-engine/entities/reward-definition.entity';
import { FeatureFlagsService } from '../../common/feature-flags/feature-flags.service';
import { VoucherStatus } from '../voucher/entities/voucher.entity';
import { ApprovalStatus } from '../../common/moderation/catalog-approval';
import { DiscountType } from '../coupon/coupon.enum';
import { InstrumentScopeService } from '../partner-instruments/instrument-scope.service';
import { PartnerCallbackService } from '../partner-instruments/partner-callback.service';
import { ScopeLine, ScopeMode } from '../partner-instruments/enums';
import { InstrumentType } from '../partner-instruments/enums';
import {
  computeCouponDiscount,
  computeInstrumentApplication,
} from '../partner-instruments/pricing';
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
import { ShippingAddress } from '../shipping-address/entities/shipping-address.entity';
import {
  ShippingItemInput,
  ShippingPricingService,
} from '../shipping/shipping-pricing.service';

import { Service } from '../services/entities/service.entity';
import { McomWalletService } from '../payments/services/mcom-wallet.service';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { WalletRefundReconcileService } from './wallet-refund-reconcile.service';
import { UpdateOrderTrackingDto } from './dto/update-order-tracking.dto';
import { QuoteCheckoutDto } from './dto/quote-checkout.dto';
import { UserRole } from '../../common/role.enum';
import { randomUUID } from 'crypto';

interface AppliedReward {
  issuanceId: string;
  lineKey: string;
  targetType: RewardTargetType;
  targetId: string;
  discountAmount: number;
  rewardType?: string;
  issuerClientId?: string;
  code?: string | null;
}

export interface CheckoutQuoteItem {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CheckoutQuoteServiceBooking {
  serviceId: string;
  name: string;
  startTime: string;
  endTime: string;
  amount: number;
}

export interface CheckoutQuote {
  currency: string;
  items: CheckoutQuoteItem[];
  serviceBookings: CheckoutQuoteServiceBooking[];
  giftCardPurchases: Array<{ businessId: string; amount: number }>;
  subtotal: number;
  rewardDiscount: number;
  offerDiscount: number;
  couponDiscount: number;
  priceReducerDiscount: number;
  shippingFee: number;
  giftCardApplied: number;
  voucherApplied: number;
  moneyVoucherApplied: number;
  totalBeforeRedemption: number;
  totalAfterDiscounts: number;
  totalWithShipping: number;
  finalAmount: number;
  applied: {
    offer: { id: string; name: string } | null;
    coupon: { code: string } | null;
    giftCard: { code: string; requested: number; applied: number } | null;
    voucher: { code: string; requested: number; applied: number } | null;
    moneyVoucher: {
      code: string;
      requested: number;
      applied: number;
    } | null;
    rewards: Array<{
      issuanceId: string;
      lineKey: string;
      discountAmount: number;
    }>;
  };
}


interface QuoteResponseInput {
  isDirectPurchase: boolean;
  directPurchaseProduct: Product | null;
  directPurchase?: {
    productId: string;
    quantity: number;
    variant?: Record<string, string>;
    selectedVariants?: Record<string, string>;
  };
  isCartCheckout: boolean;
  cart: any;
  productTotal: number;
  serviceBookingTotal: number;
  giftCardPurchaseTotal: number;
  totalBeforeRedemption: number;
  totalAfterDiscounts: number;
  rewardDiscountTotal: number;
  offer: Offer | null;
  offerDiscount: number;
  couponAmountToApply: number;
  appliedCoupon: {
    id: string;
    code: string;
    issuanceId: string | null;
  } | null;
  priceReducerAmountToApply: number;
  estimatedShippingFee: number;
  totalWithShipping: number;
  giftCardAmountToApply: number;
  appliedGiftCard: {
    id: string;
    code: string;
    issuanceId: string | null;
  } | null;
  voucherAmountToApply: number;
  appliedVoucher: {
    id: string;
    code: string;
    issuanceId: string | null;
  } | null;
  moneyVoucherAmountToApply: number;
  finalAmount: number;
  serviceBookingLines: CheckoutQuoteServiceBooking[];
  giftCardPurchases?: Array<{ businessId: string; amount: number }>;
  rewardResolution: { applications: AppliedReward[]; total: number };
  dto: CreateCheckoutDto;
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderItemReward)
    private readonly orderItemRewardRepository: Repository<OrderItemReward>,
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
    @InjectRepository(ShippingAddress)
    private readonly shippingAddressRepository: Repository<ShippingAddress>,
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
    private readonly pointsService: PointsService,
    private readonly loyaltyService: LoyaltyService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    private readonly entityManager: EntityManager,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    private readonly shippingPricingService: ShippingPricingService,
    @Inject(forwardRef(() => McomWalletService))
    private readonly mcomWalletService: McomWalletService,
    @Inject(forwardRef(() => PaymentProviderService))
    private readonly paymentProviderService: PaymentProviderService,
    @Inject(forwardRef(() => WalletRefundReconcileService))
    private readonly walletRefundReconcileService: WalletRefundReconcileService,
    private readonly rewardsIntegrationService: RewardsIntegrationService,
    private readonly rewardsClient: RewardsClientService,
    private readonly rewardReconcileService: RewardRedemptionReconcileService,
    private readonly instrumentScopeService: InstrumentScopeService,
    private readonly partnerCallbacks: PartnerCallbackService,
    private readonly moneyEngineService: MoneyEngineService,
    private readonly featureFlags: FeatureFlagsService,
  ) {}

  private validateBusinessAndOwner(business: Business) {
    if (!business) {
      throw new NotFoundException('Business not found.');
    }
    if (business.status !== BusinessStatus.PUBLISHED) {
      throw new BadRequestException(
        `Business "${business.businessName}" is not currently active and cannot accept orders.`,
      );
    }
    if (!business.user || !business.user.isActive) {
      throw new BadRequestException(
        `The owner of business "${business.businessName}" is not currently active and cannot accept orders.`,
      );
    }
  }

  /** Only approved, published and non-delisted products can be purchased. */
  private validateProductIsPurchasable(product: Product) {
    if (
      product.approvalStatus !== ApprovalStatus.APPROVED ||
      product.productStatus !== 'published' ||
      product.visibility !== 'public' ||
      product.adminDisabled
    ) {
      throw new BadRequestException(
        `"${product.title}" is not available for purchase.`,
      );
    }
  }

  async checkout(
    userId: string,
    createCheckoutDto: CreateCheckoutDto,
  ): Promise<Order> {
    return (await this.resolveCheckout(userId, createCheckoutDto, {
      dryRun: false,
    })) as Order;
  }

  /**
   * Server-authoritative pricing for the storefront.
   *
   * Runs the exact same resolution as checkout but stops before any payment or
   * order write. The client must use this quote (including scoped-instrument
   * caps) for the amount it asks the payment provider to charge.
   */
  async quote(
    userId: string,
    quoteDto: QuoteCheckoutDto,
  ): Promise<CheckoutQuote> {
    return (await this.resolveCheckout(
      userId,
      {
        ...quoteDto,
        payment: {
          paymentMethod: PaymentMethod.STRIPE,
          amount: 0,
        },
      },
      { dryRun: true },
    )) as CheckoutQuote;
  }

  private buildQuoteResponse(input: QuoteResponseInput): CheckoutQuote {
    const items: CheckoutQuoteItem[] = [];

    if (
      input.isDirectPurchase &&
      input.directPurchaseProduct &&
      input.directPurchase
    ) {
      const unitPrice = this.productService.calculatePrice(
        input.directPurchaseProduct,
        input.directPurchase.variant || input.directPurchase.selectedVariants || {},
      );
      items.push({
        productId: input.directPurchaseProduct.id,
        title: input.directPurchaseProduct.title,
        quantity: input.directPurchase.quantity,
        unitPrice,
        lineTotal: round2(unitPrice * input.directPurchase.quantity),
      });
    } else if (input.isCartCheckout) {
      for (const item of input.cart?.items ?? []) {
        const unitPrice = this.productService.calculatePrice(
          item.product,
          item.selectedVariants || {},
        );
        items.push({
          productId: item.product.id,
          title: item.product.title,
          quantity: item.quantity,
          unitPrice,
          lineTotal: round2(unitPrice * item.quantity),
        });
      }
    }

    const giftCardRequested = Number(
      input.dto.giftCardAmount ?? input.giftCardAmountToApply,
    );
    const voucherRequested = Number(
      input.dto.voucherAmount ?? input.voucherAmountToApply,
    );
    const moneyVoucherRequested = Number(
      input.dto.moneyVoucherAmount ?? input.moneyVoucherAmountToApply,
    );

    return {
      currency: 'GBP',
      items,
      serviceBookings: input.serviceBookingLines,
      giftCardPurchases: (input.giftCardPurchases ?? []).map((purchase) => ({
        businessId: purchase.businessId,
        amount: Number(purchase.amount),
      })),
      subtotal: round2(
        input.productTotal +
          input.serviceBookingTotal +
          input.giftCardPurchaseTotal,
      ),
      rewardDiscount: round2(input.rewardDiscountTotal),
      offerDiscount: round2(input.offerDiscount),
      couponDiscount: round2(input.couponAmountToApply),
      priceReducerDiscount: round2(input.priceReducerAmountToApply),
      shippingFee: round2(input.estimatedShippingFee),
      giftCardApplied: round2(input.giftCardAmountToApply),
      voucherApplied: round2(input.voucherAmountToApply),
      moneyVoucherApplied: round2(input.moneyVoucherAmountToApply),
      totalBeforeRedemption: round2(input.totalBeforeRedemption),
      totalAfterDiscounts: round2(input.totalAfterDiscounts),
      totalWithShipping: round2(input.totalWithShipping),
      finalAmount: round2(input.finalAmount),
      applied: {
        offer: input.offer
          ? { id: input.offer.id, name: input.offer.name }
          : null,
        coupon: input.appliedCoupon
          ? { code: input.appliedCoupon.code }
          : null,
        giftCard:
          input.appliedGiftCard && input.giftCardAmountToApply > 0
            ? {
                code: input.appliedGiftCard.code,
                requested: round2(giftCardRequested),
                applied: round2(input.giftCardAmountToApply),
              }
            : null,
        voucher:
          input.appliedVoucher && input.voucherAmountToApply > 0
            ? {
                code: input.appliedVoucher.code,
                requested: round2(voucherRequested),
                applied: round2(input.voucherAmountToApply),
              }
            : null,
        moneyVoucher:
          input.dto.moneyVoucherCode &&
          input.moneyVoucherAmountToApply > 0
            ? {
                code: input.dto.moneyVoucherCode,
                requested: round2(moneyVoucherRequested),
                applied: round2(input.moneyVoucherAmountToApply),
              }
            : null,
        rewards: (input.rewardResolution?.applications ?? []).map(
          (application) => ({
            issuanceId: application.issuanceId,
            lineKey: application.lineKey,
            discountAmount: round2(application.discountAmount),
          }),
        ),
      },
    };
  }

  private async resolveCheckout(
    userId: string,
    createCheckoutDto: CreateCheckoutDto,
    options: { dryRun: boolean },
  ): Promise<Order | CheckoutQuote> {
    const {
      directPurchase,
      giftCardPurchases,
      serviceBookings,
      shippingAddressId,
      carrierCode,
      rewardApplications,
    } = createCheckoutDto;
    const cart = await this.cartService.getCart(userId);

    const isCartCheckout = !directPurchase && cart && cart.items.length > 0;
    const isDirectPurchase = !!directPurchase;
    const hasGiftCardPurchases =
      giftCardPurchases && giftCardPurchases.length > 0;

    if (!isCartCheckout && !isDirectPurchase && !hasGiftCardPurchases) {
      throw new BadRequestException(
        'Checkout is empty. Please add items to your cart, specify a direct purchase, or purchase a gift card.',
      );
    }
    if (isCartCheckout && isDirectPurchase) {
      throw new BadRequestException(
        'Cannot process a cart checkout and a direct purchase in the same transaction.',
      );
    }

    let productTotal = 0;
    const productIds: string[] = [];
    const productOwnerById = new Map<string, string>();
    const earningsPerOwner: Map<string, number> = new Map();
    let businessContextId: string | null = null;
    let directPurchaseProduct: Product | null = null;

    if (isDirectPurchase) {
      const product = await this.productRepository.findOne({
        where: { id: directPurchase.productId },
        relations: ['business', 'business.user'],
      });
      if (!product) {
        throw new NotFoundException(
          `Product with ID "${directPurchase.productId}" not found.`,
        );
      }
      this.validateProductIsPurchasable(product);
      this.validateBusinessAndOwner(product.business);

      if (product.enableStockManagement) {
        if (product.stock < directPurchase.quantity) {
          throw new ConflictException(
            `Insufficient stock for product "${product.title}". Requested: ${directPurchase.quantity}, Available: ${product.stock}.`,
          );
        }
      }

      directPurchaseProduct = product;
      businessContextId = product.business.id;
      const ownerId = product.business.user.id;

      const price = this.productService.calculatePrice(
        product,
        directPurchase.variant || directPurchase.selectedVariants || {},
      );
      productTotal = price * directPurchase.quantity;

      productIds.push(product.id);
      productOwnerById.set(product.id, ownerId);
      earningsPerOwner.set(
        ownerId,
        (earningsPerOwner.get(ownerId) || 0) + productTotal,
      );
    } else if (isCartCheckout) {
      // Determine context from first cart item for legacy reasons (e.g. gift card redemption logic)
      businessContextId = cart.items[0].product.businessId;

      for (const item of cart.items) {
        this.validateProductIsPurchasable(item.product);
        this.validateBusinessAndOwner(item.product.business);

        if (item.product.enableStockManagement) {
          if (item.product.stock < item.quantity) {
            throw new ConflictException(
              `Insufficient stock for product "${item.product.title}". Requested: ${item.quantity}, Available: ${item.product.stock}.`,
            );
          }
        }

        const price = this.productService.calculatePrice(
          item.product,
          item.selectedVariants || {},
        );
        const itemTotal = price * item.quantity;
        const ownerId = item.product.business.user.id;

        productTotal += itemTotal;
        productIds.push(item.product.id);
        productOwnerById.set(item.product.id, ownerId);
        earningsPerOwner.set(
          ownerId,
          (earningsPerOwner.get(ownerId) || 0) + itemTotal,
        );
      }
    }

    let serviceBookingTotal = 0;
    const serviceBookingLines: CheckoutQuoteServiceBooking[] = [];
    const serviceById = new Map<string, Service>();
    if (serviceBookings && serviceBookings.length > 0) {
      if (!isDirectPurchase) {
        throw new BadRequestException(
          'Partnered services can only be booked with a direct product purchase.',
        );
      }
      const partneredServices =
        await this.partnershipService.getProductPartnerships(
          directPurchase.productId,
        );
      const partneredServiceIds = partneredServices.map((s) => s.id);

      // Batch-load all services to avoid N+1
      const serviceIds = serviceBookings.map((b) => b.serviceId);
      const services = await this.entityManager.getRepository(Service).find({
        where: { id: In(serviceIds) },
        relations: [
          'business',
          'business.user',
          'configurableAddons',
        ],
      });
      for (const service of services) {
        serviceById.set(service.id, service);
      }

      for (const bookingDetail of serviceBookings) {
        if (!partneredServiceIds.includes(bookingDetail.serviceId)) {
          throw new BadRequestException(
            `Service with ID ${bookingDetail.serviceId} is not partnered with the specified product.`,
          );
        }

        // Validate service business status
        const service = serviceById.get(bookingDetail.serviceId);
        if (
          !service ||
          service.approvalStatus !== ApprovalStatus.APPROVED ||
          service.status !== 'published' ||
          !service.isActive ||
          service.adminDisabled
        ) {
          throw new BadRequestException(
            `Service with ID ${bookingDetail.serviceId} is not available for booking.`,
          );
        }
        this.validateBusinessAndOwner(service.business);

        // Bundled service bookings are charged with the product. Use the same
        // authoritative pricing as standalone bookings so they cannot be free.
        const pricing = this.bookingService.quoteForService(
          service,
          bookingDetail.startTime,
          bookingDetail.endTime,
        );
        serviceBookingTotal += pricing.totalAmount;
        serviceBookingLines.push({
          serviceId: service.id,
          name: service.name,
          startTime: new Date(bookingDetail.startTime).toISOString(),
          endTime: new Date(bookingDetail.endTime).toISOString(),
          amount: pricing.totalAmount,
        });
      }
      serviceBookingTotal = round2(serviceBookingTotal);
    }

    let giftCardPurchaseTotal = 0;
    if (hasGiftCardPurchases) {
      // Batch-load all businesses to avoid N+1
      const businessIds = giftCardPurchases.map((gc) => gc.businessId);
      const businesses = await this.businessRepository.find({
        where: { id: In(businessIds) },
        relations: ['user'],
      });
      const businessesMap = new Map(businesses.map((b) => [b.id, b]));

      for (const gcPurchase of giftCardPurchases) {
        const business = businessesMap.get(gcPurchase.businessId);
        if (!business) {
          throw new NotFoundException(
            `Business with ID "${gcPurchase.businessId}" not found for gift card purchase.`,
          );
        }
        this.validateBusinessAndOwner(business);

        const purchaseOwnerId = business.user.id;

        if (!businessContextId) {
          businessContextId = gcPurchase.businessId;
        }

        giftCardPurchaseTotal += gcPurchase.amount;
        // Gift card purchases are also earnings for the owner
        earningsPerOwner.set(
          purchaseOwnerId,
          (earningsPerOwner.get(purchaseOwnerId) || 0) + gcPurchase.amount,
        );
      }
    }

    const totalBeforeRedemption = round2(
      productTotal + serviceBookingTotal + giftCardPurchaseTotal,
    );

    // --- MCOM Rewards discount application (per line item) ---
    const rewardLinesBuilt: EligibilityLine[] =
      await this.rewardsIntegrationService.buildProductLines(
        isDirectPurchase
          ? [
              {
                productId: directPurchase.productId,
                quantity: directPurchase.quantity,
                selectedVariants: directPurchase.variant || directPurchase.selectedVariants,
              },
            ]
          : isCartCheckout
            ? cart.items.map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
                selectedVariants: item.selectedVariants || {},
              }))
            : [],
      );
    const rewardResolution = await this.resolveRewardApplications(
      userId,
      rewardApplications,
      rewardLinesBuilt,
    );
    const rewardDiscountTotal = rewardResolution.total;

    // Canonical line list used for instrument scope matching. Reward
    // discounts are allocated per line so a scoped coupon can never stack on
    // value a reward already removed.
    const scopeLines = this.buildCheckoutScopeLines({
      isDirectPurchase,
      directPurchaseProduct,
      directPurchase,
      isCartCheckout,
      cart,
      rewardApplications: rewardResolution.applications,
    });
    for (const bookingLine of serviceBookingLines) {
      const service = serviceById.get(bookingLine.serviceId);
      scopeLines.push({
        lineKey: `service:${bookingLine.serviceId}`,
        kind: 'service',
        id: bookingLine.serviceId,
        businessId:
          (service as any)?.businessId ?? service?.business?.id ?? null,
        unitPrice: bookingLine.amount,
        quantity: 1,
        lineTotal: bookingLine.amount,
        discount: 0,
      });
    }

    // --- Loyalty offers (points redemption) -------------------------------
    // Offers are a discount, not a payment instrument. They must be resolved
    // before the final amount is calculated, otherwise the storefront can show
    // a reduced total while the order is created at full price.
    let offer: Offer | null = null;
    let offerDiscount = 0;
    if (createCheckoutDto.offerId) {
      if (createCheckoutDto.couponCode) {
        throw new BadRequestException(
          'A coupon and an offer cannot be combined on the same order.',
        );
      }

      offer = await this.offerRepository.findOne({
        where: { id: createCheckoutDto.offerId },
        relations: [
          'user',
          'includedProducts',
          'excludedProducts',
          'freeProduct',
        ],
      });
      if (!offer) throw new NotFoundException('Offer not found');
      if (
        offer.approvalStatus !== ApprovalStatus.APPROVED ||
        offer.adminDisabled ||
        !offer.isActive
      ) {
        throw new BadRequestException('Offer is no longer available.');
      }
      if (offer.beginDate && new Date(offer.beginDate) > new Date()) {
        throw new BadRequestException('Offer has not started yet.');
      }
      if (offer.endDate && new Date(offer.endDate) < new Date()) {
        throw new BadRequestException('Offer has expired.');
      }
      if (!offer.user) {
        throw new NotFoundException('Offer creator not found.');
      }
      if (offer.user.id === userId) {
        throw new BadRequestException(
          'You cannot redeem an offer from your own business.',
        );
      }

      const customer = await this.userRepository.findOne({
        where: { id: userId },
      });
      if ((customer?.points ?? 0) < offer.points) {
        throw new BadRequestException(
          'Insufficient points to redeem this offer.',
        );
      }

      const includedIds = new Set(
        (offer.includedProducts ?? []).map((product) => product.id),
      );
      const excludedIds = new Set(
        (offer.excludedProducts ?? []).map((product) => product.id),
      );
      const eligibleLines = scopeLines.filter((line) => {
        if (line.kind !== 'product') return false;
        if (productOwnerById.get(line.id) !== offer.user.id) return false;
        if (excludedIds.has(line.id)) return false;
        if (includedIds.size > 0 && !includedIds.has(line.id)) return false;
        return true;
      });
      const eligibleSubtotal = round2(
        eligibleLines.reduce(
          (sum, line) =>
            sum + Math.max(0, line.lineTotal - (line.discount ?? 0)),
          0,
        ),
      );
      if (eligibleSubtotal <= 0) {
        throw new BadRequestException(
          'This offer does not apply to any item in the cart.',
        );
      }

      switch (offer.rewardCouponType) {
        case RewardCouponType.FIXED_CART_DISCOUNT:
          offerDiscount = Math.min(
            eligibleSubtotal,
            Number(offer.discountAmount) || 0,
          );
          break;
        case RewardCouponType.PERCENTAGE_DISCOUNT:
          offerDiscount =
            (eligibleSubtotal * (Number(offer.discountPercentage) || 0)) / 100;
          break;
        case RewardCouponType.FREE_PRODUCTS: {
          const freeProductId = offer.freeProduct?.id;
          const freeLine = freeProductId
            ? eligibleLines.find((line) => line.id === freeProductId)
            : undefined;
          if (!freeLine) {
            throw new BadRequestException(
              'The free product from this offer is not in the cart.',
            );
          }
          offerDiscount = Math.min(
            freeLine.unitPrice,
            Math.max(0, freeLine.lineTotal - (freeLine.discount ?? 0)),
          );
          break;
        }
        case RewardCouponType.BONUS_POINTS:
          offerDiscount = 0;
          break;
        default:
          throw new BadRequestException('Invalid offer type.');
      }

      offerDiscount = round2(
        Math.min(
          Math.max(0, offerDiscount),
          Math.max(0, totalBeforeRedemption - rewardDiscountTotal),
        ),
      );
    }

    let couponAmountToApply = 0;
    let couponEligibleSubtotal: number | null = null;
    let couponIssuanceId: string | null = null;
    let couponScopeMode: string | null = null;
    let appliedCoupon: { id: string; code: string; issuanceId: string | null } | null = null;
    if (createCheckoutDto.couponCode) {
      try {
        const user = await this.userRepository.findOne({
          where: { id: userId },
        });
        const coupon = await this.couponService.validateCoupon(
          createCheckoutDto.couponCode,
          user,
        );
        couponIssuanceId = coupon.issuanceId ?? null;
        appliedCoupon = {
          id: coupon.id,
          code: coupon.code,
          issuanceId: coupon.issuanceId ?? null,
        };
        const couponScope = await this.instrumentScopeService.getEffectiveScope(
          InstrumentType.COUPON,
          { id: coupon.id, businessId: coupon.business?.id ?? null },
        );
        couponScopeMode = couponScope?.scopeMode ?? ScopeMode.NO_SCOPE;
        const isScoped =
          !!couponScope && couponScope.scopeMode !== ScopeMode.NO_SCOPE;

        let couponBase = Math.max(0, totalBeforeRedemption - rewardDiscountTotal);
        if (isScoped) {
          const eligible = this.instrumentScopeService.computeEligible(
            couponScope,
            scopeLines,
          );
          couponEligibleSubtotal = round2(
            eligible.lines.reduce(
              (sum, line) =>
                sum + Math.max(0, line.lineTotal - (line.discount ?? 0)),
              0,
            ),
          );
          if (couponEligibleSubtotal <= 0) {
            throw new UnprocessableEntityException(
              'SCOPE_NO_ELIGIBLE_LINES: this coupon does not apply to any item in the cart.',
            );
          }
          couponBase = couponEligibleSubtotal;
        }

        if (coupon.discountType === DiscountType.FIXED) {
          couponAmountToApply = computeCouponDiscount({
            discountType: 'fixed',
            discountValue: Number(coupon.discountValue),
            base: couponBase,
          });
        } else {
          couponAmountToApply = computeCouponDiscount({
            discountType: 'percentage',
            discountValue: Number(coupon.discountValue),
            base: couponBase,
            maxDiscount: Number((coupon as any).maxDiscount),
          });
        }
        couponAmountToApply = round2(Math.max(0, couponAmountToApply));
      } catch (error) {
        if (error instanceof UnprocessableEntityException) throw error;
        throw new BadRequestException(`Invalid coupon: ${error.message}`);
      }
    }

    // Voucher Coupon (price reducer): single-use discount in the discount slot.
    const scopeSubtotalForPriceReducer = round2(
      scopeLines.reduce((sum, line) => sum + line.lineTotal, 0),
    );
    let priceReducerAmountToApply = 0;
    if (createCheckoutDto.priceReducerCode) {
      try {
        const priceReducer = await this.moneyEngineService.getOwnedByCode(
          createCheckoutDto.priceReducerCode,
          { id: userId },
        );
        const scope = this.moneyEngineService.getScopeForDefinition(
          priceReducer.definition,
        );
        const isScoped = !!scope && scope.mode !== ScopeMode.NO_SCOPE;
        const eligible = this.instrumentScopeService.computeEligiblePayable(
          scope,
          scopeLines,
          scopeSubtotalForPriceReducer,
          Math.max(
            0,
            totalBeforeRedemption -
              couponAmountToApply -
              rewardDiscountTotal,
          ),
        );
        if (isScoped && eligible.eligibleSubtotal <= 0) {
          throw new UnprocessableEntityException(
            'SCOPE_NO_ELIGIBLE_LINES: this Voucher Coupon does not apply to any item in the cart.',
          );
        }
        const resolved = await this.moneyEngineService.resolvePriceReducer(
          createCheckoutDto.priceReducerCode,
          { id: userId },
          isScoped
            ? eligible.eligibleSubtotal
            : Math.max(
                0,
                totalBeforeRedemption -
                  couponAmountToApply -
                  rewardDiscountTotal,
              ),
        );
        priceReducerAmountToApply = resolved.amount;
      } catch (error) {
        if (error instanceof UnprocessableEntityException) throw error;
        throw new BadRequestException(
          `Invalid Voucher Coupon: ${error.message}`,
        );
      }
    }

    const totalAfterDiscounts = round2(
      totalBeforeRedemption -
        offerDiscount -
        couponAmountToApply -
        rewardDiscountTotal -
        priceReducerAmountToApply,
    );

    // Dynamic Shipping Fee Calculation (Royal Mail pricing API with DB fallback)
    const shippingItems: ShippingItemInput[] = [];
    if (isDirectPurchase && directPurchaseProduct) {
      shippingItems.push({
        quantity: directPurchase.quantity,
        weightKg: directPurchaseProduct.weight,
        lengthCm: directPurchaseProduct.length,
        widthCm: directPurchaseProduct.width,
        heightCm: directPurchaseProduct.height,
      });
    } else if (isCartCheckout) {
      for (const cartItem of cart.items) {
        shippingItems.push({
          quantity: cartItem.quantity,
          weightKg: cartItem.product.weight,
          lengthCm: cartItem.product.length,
          widthCm: cartItem.product.width,
          heightCm: cartItem.product.height,
        });
      }
    }

    let shippingAddress: ShippingAddress | null = null;
    if (shippingAddressId) {
      shippingAddress = await this.shippingAddressRepository.findOne({
        where: { id: shippingAddressId, user: { id: userId } },
      });
      if (!shippingAddress) {
        throw new NotFoundException('Shipping address not found');
      }
    }

    let estimatedShippingFee = 0;
    if (carrierCode) {
      const shippingQuote = await this.shippingPricingService.getShippingFee(
        carrierCode,
        shippingItems,
        shippingAddress?.postalCode,
      );
      estimatedShippingFee = shippingQuote.fee;

      // Apply free shipping threshold for Royal Mail Tracked 48
      if (carrierCode === 'royalmail' && totalAfterDiscounts >= 50) {
        estimatedShippingFee = 0;
      }
    }

    const totalWithShipping = round2(totalAfterDiscounts + estimatedShippingFee);

    const itemSubtotalForInstruments = round2(
      scopeLines.reduce((sum, line) => sum + line.lineTotal, 0),
    );

    let giftCardAmountToApply = 0;
    let appliedGiftCard:
      | { id: string; code: string; issuanceId: string | null }
      | null = null;
    if (createCheckoutDto.giftCardCode) {
      try {
        const giftCard = await this.giftCardService.findActiveCardByCode(
          createCheckoutDto.giftCardCode,
        );
        appliedGiftCard = {
          id: giftCard.id,
          code: giftCard.code,
          issuanceId: giftCard.issuanceId ?? null,
        };
        const balance = {
          currentBalance: Number(giftCard.currentBalance),
        };
        const giftCardBinding =
          await this.giftCardService.getBusinessBinding(giftCard);
        const giftCardScope =
          await this.instrumentScopeService.getEffectiveScope(
            InstrumentType.GIFT_CARD,
            { id: giftCard.id, businessId: giftCardBinding },
          );
        const isScoped =
          !!giftCardScope && giftCardScope.scopeMode !== ScopeMode.NO_SCOPE;
        const eligible = this.instrumentScopeService.computeEligiblePayable(
          giftCardScope,
          scopeLines,
          itemSubtotalForInstruments,
          totalWithShipping,
        );
        if (isScoped && eligible.eligibleSubtotal <= 0) {
          throw new UnprocessableEntityException(
            'SCOPE_NO_ELIGIBLE_LINES: this gift card does not apply to any item in the cart.',
          );
        }
        const maxApplicable = isScoped
          ? eligible.eligibleSubtotal
          : totalWithShipping;

        if (createCheckoutDto.giftCardAmount) {
          if (createCheckoutDto.giftCardAmount > balance.currentBalance) {
            throw new BadRequestException('Gift card amount exceeds balance.');
          }
          giftCardAmountToApply = computeInstrumentApplication({
            requested: createCheckoutDto.giftCardAmount,
            balance: balance.currentBalance,
            eligiblePayable: maxApplicable,
            remainingPayable: totalWithShipping,
          });
        } else {
          giftCardAmountToApply = computeInstrumentApplication({
            balance: balance.currentBalance,
            eligiblePayable: maxApplicable,
            remainingPayable: totalWithShipping,
          });
        }
        giftCardAmountToApply = round2(Math.max(0, giftCardAmountToApply));
      } catch (error) {
        if (error instanceof UnprocessableEntityException) throw error;
        throw new BadRequestException(
          `Invalid or expired gift card: ${error.message}`,
        );
      }
    }

    const totalAfterGiftCard = round2(totalWithShipping - giftCardAmountToApply);

    let voucherAmountToApply = 0;
    let appliedVoucher:
      | { id: string; code: string; issuanceId: string | null }
      | null = null;
    if (createCheckoutDto.voucherCode) {
      try {
        const voucher = await this.voucherService.findVoucherByCode(
          createCheckoutDto.voucherCode,
        );
        appliedVoucher = {
          id: voucher.id,
          code: voucher.code,
          issuanceId: voucher.issuanceId ?? null,
        };
        if (
          voucher.status === VoucherStatus.REDEEMED ||
          voucher.status === VoucherStatus.DISABLED ||
          (voucher.expiresAt && new Date() > voucher.expiresAt)
        ) {
          throw new BadRequestException('Voucher is invalid or expired.');
        }
        if (
          (voucher.voucherProduct as any)?.usage === 'instore_only'
        ) {
          throw new BadRequestException(
            'This voucher can only be redeemed in store.',
          );
        }
        const voucherScope = await this.instrumentScopeService.getEffectiveScope(
          InstrumentType.VOUCHER,
          {
            id: voucher.id,
            businessId:
              voucher.businessId ?? (voucher as any).business?.id ?? null,
          },
        );
        const isScoped =
          !!voucherScope && voucherScope.scopeMode !== ScopeMode.NO_SCOPE;
        const eligible = this.instrumentScopeService.computeEligiblePayable(
          voucherScope,
          scopeLines,
          itemSubtotalForInstruments,
          totalAfterGiftCard,
        );
        if (isScoped && eligible.eligibleSubtotal <= 0) {
          throw new UnprocessableEntityException(
            'SCOPE_NO_ELIGIBLE_LINES: this voucher does not apply to any item in the cart.',
          );
        }
        const maxApplicable = isScoped
          ? eligible.eligibleSubtotal
          : totalAfterGiftCard;

        if (createCheckoutDto.voucherAmount) {
          if (createCheckoutDto.voucherAmount > voucher.balance) {
            throw new BadRequestException('Voucher amount exceeds balance.');
          }
          voucherAmountToApply = computeInstrumentApplication({
            requested: createCheckoutDto.voucherAmount,
            balance: Number(voucher.balance),
            eligiblePayable: maxApplicable,
            remainingPayable: totalAfterGiftCard,
          });
        } else {
          voucherAmountToApply = computeInstrumentApplication({
            balance: Number(voucher.balance),
            eligiblePayable: maxApplicable,
            remainingPayable: totalAfterGiftCard,
          });
        }
        voucherAmountToApply = round2(Math.max(0, voucherAmountToApply));
      } catch (error) {
        if (error instanceof UnprocessableEntityException) throw error;
        throw new BadRequestException(`Invalid voucher: ${error.message}`);
      }
    }

    const totalAfterVoucher = round2(
      totalAfterGiftCard - voucherAmountToApply,
    );
    let moneyVoucherAmountToApply = 0;
    if (createCheckoutDto.moneyVoucherCode) {
      try {
        if (!this.featureFlags.isMoneyVoucherCheckoutEnabled()) {
          throw new BadRequestException(
            'Money vouchers are not enabled at checkout.',
          );
        }

        const moneyVoucher = await this.moneyEngineService.getOwnedByCode(
          createCheckoutDto.moneyVoucherCode,
          { id: userId },
        );
        const behavior =
          moneyVoucher.functionalType ??
          moneyVoucher.definition?.functionalType;
        if (behavior === FunctionalType.PRICE_REDUCER) {
          throw new BadRequestException(
            'This voucher can only be applied as a discount, not as payment.',
          );
        }

        const scope = this.moneyEngineService.getScopeForDefinition(
          moneyVoucher.definition,
        );
        const isScoped = !!scope && scope.mode !== ScopeMode.NO_SCOPE;
        const eligible = this.instrumentScopeService.computeEligiblePayable(
          scope,
          scopeLines,
          itemSubtotalForInstruments,
          totalAfterVoucher,
        );
        if (isScoped && eligible.eligibleSubtotal <= 0) {
          throw new UnprocessableEntityException(
            'SCOPE_NO_ELIGIBLE_LINES: this voucher does not apply to any item in the cart.',
          );
        }

        const maxApplicable = isScoped
          ? eligible.eligibleSubtotal
          : totalAfterVoucher;
        const balance = round2(
          Number(moneyVoucher.realBalance) +
            Number(moneyVoucher.rewardBalance),
        );
        moneyVoucherAmountToApply = computeInstrumentApplication({
          requested: createCheckoutDto.moneyVoucherAmount,
          balance,
          eligiblePayable: maxApplicable,
          remainingPayable: totalAfterVoucher,
        });
      } catch (error) {
        if (error instanceof UnprocessableEntityException) throw error;
        throw new BadRequestException(
          `Invalid money voucher: ${error.message}`,
        );
      }
    }

    const finalAmount = round2(totalAfterVoucher - moneyVoucherAmountToApply);

    const quoteInput: QuoteResponseInput = {
      isDirectPurchase,
      directPurchaseProduct,
      directPurchase,
      isCartCheckout,
      cart,
      productTotal,
      serviceBookingTotal,
      giftCardPurchaseTotal,
      totalBeforeRedemption,
      totalAfterDiscounts,
      rewardDiscountTotal,
      offer,
      offerDiscount,
      couponAmountToApply,
      appliedCoupon,
      priceReducerAmountToApply,
      estimatedShippingFee,
      totalWithShipping,
      giftCardAmountToApply,
      appliedGiftCard,
      voucherAmountToApply,
      appliedVoucher,
      moneyVoucherAmountToApply,
      finalAmount,
      serviceBookingLines,
      giftCardPurchases,
      rewardResolution,
      dto: createCheckoutDto,
    };

    if (options.dryRun) {
      return this.buildQuoteResponse(quoteInput);
    }

    this.logger.log(
      `[checkout] instruments ${JSON.stringify({
        couponIssuanceId,
        couponScopeMode,
        couponEligibleSubtotal,
        couponApplied: couponAmountToApply,
        giftCardIssuanceId: appliedGiftCard?.issuanceId ?? null,
        giftCardApplied: giftCardAmountToApply,
        voucherIssuanceId: appliedVoucher?.issuanceId ?? null,
        voucherApplied: voucherAmountToApply,
        finalAmount,
      })}`,
    );

    if (
      Number(createCheckoutDto.payment.amount).toFixed(2) !==
      finalAmount.toFixed(2)
    ) {
      // The quote is authoritative. Returning the refreshed quote lets the
      // storefront recreate the payment intent for the correct amount instead
      // of failing with an opaque "prices do not tally" error.
      throw new ConflictException({
        error: 'QUOTE_CHANGED',
        message: `The order total changed from ${Number(
          createCheckoutDto.payment.amount,
        ).toFixed(2)} to ${finalAmount.toFixed(2)}. Please review the refreshed total and try again.`,
        finalAmount,
        quote: this.buildQuoteResponse(quoteInput),
      });
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    // Reserve all selected rewards BEFORE charging, so a reward can never be
    // double-spent by a concurrent checkout. Released on any failure below.
    let rewardReservationRef: string | null = null;
    if (rewardResolution.applications.length > 0) {
      rewardReservationRef = `mall-order-${randomUUID()}`;
      await this.reserveRewards(
        rewardResolution.applications,
        rewardReservationRef,
      );
    }

    let walletRequested = false;
    let walletTransactionId: string | null = null;
    let paidChargeId: string | null = null;
    let paidProviderRef: string | null = null;
    let paidFeeMinor: string | null = null;
    let paidNetMinor: string | null = null;

    try {
    // --- Server-side payment verification for card / PayPal ---
    // Never trust a client-supplied transactionId: confirm the charge with the
    // provider and match the amount before creating the order.
    if (finalAmount > 0) {
      const method = createCheckoutDto.payment.paymentMethod;
      const transactionId = createCheckoutDto.payment.transactionId;

      if (method === PaymentMethod.STRIPE || method === PaymentMethod.PAYPAL) {
        if (!transactionId) {
          throw new BadRequestException(
            'A payment transaction ID is required for this payment method.',
          );
        }
        const verification =
          method === PaymentMethod.STRIPE
            ? await this.paymentProviderService.verifyStripePaymentIntent(
                transactionId,
                Number(finalAmount.toFixed(2)),
                'gbp',
                {
                  mallUserId: userId,
                  mcomUserId: user.centralUserId,
                },
              )
            : await this.paymentProviderService.captureAndVerifyPaypalOrder(
                transactionId,
                Number(finalAmount.toFixed(2)),
                'gbp',
                {
                  mallUserId: userId,
                  mcomUserId: user.centralUserId,
                },
              );
        if (!verification.ok) {
          throw new BadRequestException(
            `Payment verification failed: ${verification.reason}`,
          );
        }
        const details: any = verification.details ?? {};
        paidChargeId = details.id ?? null;
        paidProviderRef = details.providerRef ?? null;
        paidFeeMinor = details.feeMinor ?? null;
        paidNetMinor = details.netMinor ?? null;
      } else if (method !== PaymentMethod.MCOM_WALLET) {
        throw new BadRequestException('Unsupported payment method.');
      }
    }

    // --- MCOM Wallet payment path (settled through MCOM Pay) ---
    walletRequested =
      createCheckoutDto.payment.paymentMethod === PaymentMethod.MCOM_WALLET;
    if (walletRequested && finalAmount > 0) {
      if (!this.mcomWalletService.isEnabled()) {
        throw new BadRequestException(
          'MCOM Wallet payments are currently disabled.',
        );
      }
      const centralUserId = user.centralUserId;
      if (!centralUserId) {
        throw new BadRequestException(
          'MCOM Wallet is not linked for this account. Please re-authenticate via SSO.',
        );
      }
      if (!createCheckoutDto.payment.idempotencyKey) {
        throw new BadRequestException(
          'A checkout idempotency key is required for MCOM Wallet payments.',
        );
      }
      const charge = await this.paymentProviderService.createWalletCharge(
        Number(finalAmount.toFixed(2)),
        'GBP',
        {
          reference: `mall-order-${userId}`,
          userId,
          idempotencyKey: createCheckoutDto.payment.idempotencyKey,
          description: 'MCOM Mall order',
        },
        centralUserId,
      );
      if (charge.status !== 'paid') {
        throw new BadRequestException(
          `MCOM Wallet charge status ${charge.status}; payment was not settled.`,
        );
      }
      walletTransactionId = charge.chargeId;
      paidChargeId = charge.chargeId;
      try {
        const details = await this.paymentProviderService.getMcomCharge(
          charge.chargeId,
        );
        paidProviderRef = details.providerRef ?? null;
        paidFeeMinor = details.feeMinor ?? null;
        paidNetMinor = details.netMinor ?? null;
      } catch {
        // Fee/net are reporting fields; the charge itself is already verified.
      }
    }
    } catch (preOrderErr) {
      // Payment verification / wallet debit failed after rewards were reserved:
      // release them so the shopper keeps their reward.
      if (rewardResolution.applications.length > 0 && rewardReservationRef) {
        await this.releaseRewards(
          rewardResolution.applications,
          rewardReservationRef,
          'checkout_pre_order_failure',
        );
      }
      throw preOrderErr;
    }

    const existingPaidReference =
      paidChargeId ||
      walletTransactionId ||
      createCheckoutDto.payment.transactionId;
    if (existingPaidReference) {
      const existingPayment = await this.orderPaymentRepository.findOne({
        where: [
          { transactionId: existingPaidReference },
          ...(paidChargeId
            ? [{ mcomChargeId: paidChargeId }]
            : []),
        ],
        relations: ['order'],
      });
      if (existingPayment?.order) {
        // Idempotent replay: the same charge already funded an order.
        return existingPayment.order;
      }
    }

    const savedOrder = await this.entityManager
      .transaction(async (manager) => {
        const paidReference =
          paidChargeId ||
          walletTransactionId ||
          createCheckoutDto.payment.transactionId ||
          null;
        const orderPayment = manager.create(OrderPayment, {
          paymentMethod: createCheckoutDto.payment.paymentMethod,
          transactionId:
            paidReference || randomUUID(),
          user,
          amount: finalAmount,
          currency: 'gbp',
          mcomChargeId: paidChargeId || walletTransactionId || null,
          providerRef:
            paidProviderRef ||
            (createCheckoutDto.payment.paymentMethod !==
            PaymentMethod.MCOM_WALLET
              ? createCheckoutDto.payment.transactionId ?? null
              : null),
          feeMinor: paidFeeMinor,
          netMinor: paidNetMinor,
          status: finalAmount <= 0 ? 'free' : 'paid',
        });
        const savedPayment = await manager.save(orderPayment);

        const orderData: Partial<Order> = {
          user,
          items: [],
          total: finalAmount,
          payment: savedPayment,
          // Payment has already been verified above (or the order is fully
          // discounted), so the order is settled. Fulfilment is intentionally
          // not conflated with payment status.
          status: OrderStatus.COMPLETED,
          shippingAddress,
          carrierCode,
          estimatedShippingFee,
          rewardDiscountApplied: rewardDiscountTotal,
          offerDiscountApplied: offerDiscount,
          couponCode:
            couponAmountToApply > 0
              ? (appliedCoupon?.code ?? createCheckoutDto.couponCode ?? null)
              : null,
          couponDiscountApplied: couponAmountToApply,
          priceReducerCode:
            priceReducerAmountToApply > 0
              ? (createCheckoutDto.priceReducerCode ?? null)
              : null,
          priceReducerAmountApplied: priceReducerAmountToApply,
          giftCardCode:
            giftCardAmountToApply > 0
              ? (createCheckoutDto.giftCardCode ?? null)
              : null,
          giftCardAmountApplied: giftCardAmountToApply,
          voucherCode: voucherAmountToApply > 0 ? createCheckoutDto.voucherCode ?? null : null,
          voucherAmountApplied: voucherAmountToApply,
          moneyVoucherCode:
            moneyVoucherAmountToApply > 0
              ? createCheckoutDto.moneyVoucherCode ?? null
              : null,
          moneyVoucherAmountApplied: moneyVoucherAmountToApply,
        };
        if (offer) {
          orderData.appliedOffer = offer;
          orderData.pointsUsedToRedeem = offer.points;
        }
        const savedOrder = await manager.save(Order, orderData);

        if (finalAmount > 0 && paidReference) {
          // A charge can fund exactly one order. This is the replay guard.
          await this.paymentProviderService.allocateCharge(
            {
              mcomChargeId: paidChargeId || `wallet:${paidReference}`,
              purpose: 'ORDER',
              entityType: 'order',
              entityId: savedOrder.id,
              userId,
              amountMinor: String(Math.round(Number(finalAmount) * 100)),
              currency: 'GBP',
            },
            manager,
          );
        }

        if (createCheckoutDto.giftCardCode && giftCardAmountToApply > 0) {
          await this.giftCardService.redeem(
            {
              code: createCheckoutDto.giftCardCode,
              amount: giftCardAmountToApply,
            },
            savedOrder,
            businessContextId || undefined,
            manager,
            totalWithShipping,
          );
        }

        if (createCheckoutDto.voucherCode && voucherAmountToApply > 0) {
          await this.voucherService.redeemForOrder(
            {
              code: createCheckoutDto.voucherCode,
              amount: voucherAmountToApply,
            },
            savedOrder,
            manager,
          );
        }

        if (
          createCheckoutDto.priceReducerCode &&
          priceReducerAmountToApply > 0
        ) {
          const priceReducerBusinessId =
            businessContextId ??
            savedOrder.items?.[0]?.product?.business?.id ??
            null;
          await this.moneyEngineService.redeemPriceReducer(
            {
              code: createCheckoutDto.priceReducerCode,
              amount: priceReducerAmountToApply,
              userId,
              businessId: priceReducerBusinessId,
              referenceId: savedOrder.id,
              source: 'checkout',
            },
            manager,
          );
        }

        if (
          createCheckoutDto.moneyVoucherCode &&
          moneyVoucherAmountToApply > 0
        ) {
          const redemption = await this.moneyEngineService.redeemForOrder(
            {
              code: createCheckoutDto.moneyVoucherCode,
              amount: moneyVoucherAmountToApply,
              userId,
              businessId: businessContextId ?? null,
            },
            savedOrder,
            manager,
          );
          savedOrder.moneyVoucherRealAmountApplied = round2(
            redemption.realDeduction,
          );
          savedOrder.moneyVoucherRewardAmountApplied = round2(
            redemption.rewardDeduction,
          );
          await manager.save(Order, savedOrder);
        }

        if (createCheckoutDto.couponCode && couponAmountToApply > 0) {
          await this.couponService.redeemForOrder(
            {
              code: createCheckoutDto.couponCode,
              amount: couponAmountToApply,
              appliedAmount: couponAmountToApply,
              eligibleSubtotal:
                couponEligibleSubtotal ?? totalBeforeRedemption,
              issuanceId: couponIssuanceId,
              metadata: {
                scopeMode: couponEligibleSubtotal !== null ? 'SCOPED' : 'NO_SCOPE',
              },
            },
            savedOrder,
            manager,
          );
        }

        // Process product items (batched to avoid N+1 single-row INSERTs)
        if (isDirectPurchase) {
          if (directPurchaseProduct.enableStockManagement) {
            const updateResult = await manager
              .createQueryBuilder()
              .update(Product)
              .set({
                stock: () => `stock - ${Number(directPurchase.quantity)}`,
              })
              .where(
                'id = :id AND stock >= :qty AND enableStockManagement = true',
                {
                  id: directPurchaseProduct.id,
                  qty: directPurchase.quantity,
                },
              )
              .execute();

            if (updateResult.affected === 0) {
              throw new ConflictException(
                `Insufficient stock for product "${directPurchaseProduct.title}" during reservation.`,
              );
            }
          }

          const orderItem = manager.create(OrderItem, {
            order: savedOrder,
            product: directPurchaseProduct,
            quantity: directPurchase.quantity,
            price: this.productService.calculatePrice(
              directPurchaseProduct,
              directPurchase.variant || directPurchase.selectedVariants || {},
            ),
          });
          await manager.save(orderItem);
          savedOrder.items.push(orderItem);
        } else if (isCartCheckout) {
          for (const cartItem of cart.items) {
            if (cartItem.product.enableStockManagement) {
              const updateResult = await manager
                .createQueryBuilder()
                .update(Product)
                .set({ stock: () => `stock - ${Number(cartItem.quantity)}` })
                .where(
                  'id = :id AND stock >= :qty AND enableStockManagement = true',
                  {
                    id: cartItem.product.id,
                    qty: cartItem.quantity,
                  },
                )
                .execute();

              if (updateResult.affected === 0) {
                throw new ConflictException(
                  `Insufficient stock for product "${cartItem.product.title}" during reservation.`,
                );
              }
            }
          }

          const orderItems = cart.items.map((cartItem) =>
            manager.create(OrderItem, {
              order: savedOrder,
              product: cartItem.product,
              quantity: cartItem.quantity,
              price: this.productService.calculatePrice(
                cartItem.product,
                cartItem.selectedVariants || {},
              ),
            }),
          );
          if (orderItems.length > 0) {
            const savedItems = await manager.save(OrderItem, orderItems);
            savedOrder.items.push(...savedItems);
          }
        }

        // Persist reward redemptions (reserved now; committed post-payment).
        if (rewardResolution.applications.length > 0) {
          const itemIdByProduct = new Map<string, string>();
          for (const oi of savedOrder.items) {
            if (oi.product?.id) itemIdByProduct.set(oi.product.id, oi.id);
          }
          const rewardRows = rewardResolution.applications.map((app) =>
            manager.create(OrderItemReward, {
              order: savedOrder,
              orderItemId: itemIdByProduct.get(app.targetId) || null,
              rewardIssuanceId: app.issuanceId,
              issuerClientId: app.issuerClientId,
              rewardType: app.rewardType,
              targetType: app.targetType,
              targetId: app.targetId,
              discountAmount: app.discountAmount,
              status: RewardRedemptionStatus.RESERVED,
              reservationRef: rewardReservationRef,
              metadata: { code: app.code ?? null, lineKey: app.lineKey },
            }),
          );
          await manager.save(OrderItemReward, rewardRows);
        }

        const createdBookingIds: string[] = [];
        // Process service bookings
        if (serviceBookings && serviceBookings.length > 0) {
          if (!directPurchaseProduct) {
            // This should ideally not be reached due to earlier checks
            throw new BadRequestException(
              'A product must be directly purchased to book partnered services.',
            );
          }

          // Pre-fetch all partnerships to avoid N+1
          const serviceIds = serviceBookings.map((b) => b.serviceId);
          const partnerships = await this.partnershipRepository.find({
            where: [
              {
                baseProduct: { id: directPurchaseProduct.id },
                plusService: { id: In(serviceIds) },
                isActive: true,
              },
              {
                plusProduct: { id: directPurchaseProduct.id },
                baseService: { id: In(serviceIds) },
                isActive: true,
              },
            ],
          });
          const partnershipMap = new Map(
            partnerships.map((p) => [
              p.plusService?.id || p.baseService?.id,
              p,
            ]),
          );

          for (const bookingDetail of serviceBookings) {
            const serviceBooking =
              await this.bookingService.createBookingForOrder(
                {
                  serviceId: bookingDetail.serviceId,
                  startTime: bookingDetail.startTime,
                  endTime: bookingDetail.endTime,
                },
                userId,
                manager,
                { skipNotifications: true },
              );

            // Persist the authoritative service price on the booking so the
            // provider/commission ledgers are not left at zero.
            const bookedService = serviceById.get(bookingDetail.serviceId);
            if (bookedService) {
              const pricing = this.bookingService.quoteForService(
                bookedService,
                bookingDetail.startTime,
                bookingDetail.endTime,
              );
              serviceBooking.totalAmount = pricing.totalAmount;
              serviceBooking.commissionAmount = pricing.commissionAmount;
              serviceBooking.providerAmount = pricing.providerAmount;
              await manager.save(serviceBooking);

              const providerId = bookedService.business?.user?.id;
              if (providerId && pricing.providerAmount > 0) {
                await this.walletService.creditEarning(
                  {
                    userId: providerId,
                    amount: pricing.providerAmount,
                    type: WalletTransactionType.EARNING_BOOKING,
                    description: `Pending payment in escrow for booking #${serviceBooking.id}`,
                  },
                  manager,
                );
              }
            }

            createdBookingIds.push(serviceBooking.id);

            const partnership = partnershipMap.get(bookingDetail.serviceId);
            if (!partnership) {
              // This check is a safeguard; the earlier validation should prevent this.
              throw new BadRequestException(
                `Could not find an active partnership for product ${directPurchaseProduct.id} and service ${bookingDetail.serviceId}.`,
              );
            }

            const productServiceBooking =
              this.productServiceBookingRepository.create({
                order: savedOrder,
                serviceBooking,
                product: directPurchaseProduct,
                partnership,
              });
            await manager.save(productServiceBooking);
          }
        }

        const createdGiftCards: GiftCard[] = [];
        // Process new gift card purchases
        if (hasGiftCardPurchases) {
          // Batch-load businesses to avoid N+1
          const gcBusinessIds = giftCardPurchases.map((gc) => gc.businessId);
          const gcBusinesses = await this.businessRepository.find({
            where: { id: In(gcBusinessIds) },
            relations: ['user'],
          });
          const gcBusinessMap = new Map(gcBusinesses.map((b) => [b.id, b]));

          for (const gcPurchase of giftCardPurchases) {
            const businessForPurchase = gcBusinessMap.get(
              gcPurchase.businessId,
            );
            const savedGc = await this.giftCardService.purchaseGiftCard(
              gcPurchase,
              businessForPurchase,
              savedOrder,
              manager,
              { skipEarningsCredit: true, skipEmail: true },
            );
            createdGiftCards.push(savedGc);
          }
        }

        if (offer) {
          await this.pointsService.redeemPointsForOrder(
            savedOrder,
            user,
            offer,
            manager,
          );
        }

        await this.loyaltyService.awardOrderPoints(
          savedOrder.id,
          user.id,
          manager,
        );

        if (isCartCheckout) {
          await this.cartService.clearCart(userId, manager);
        }

        // Credit earnings to all business owners involved in the order
        for (const [ownerId, amount] of earningsPerOwner.entries()) {
          if (amount > 0) {
            await this.walletService.creditEarning(
              {
                userId: ownerId,
                amount: amount,
                type: WalletTransactionType.EARNING_ORDER,
                description: `Earnings from order #${savedOrder.id}`,
              },
              manager,
            );
          }
        }

        this.eventEmitter.emit('ORDER_PAID', {
          orderId: savedOrder.id,
        });

        return { savedOrder, createdGiftCards, createdBookingIds };
      })
      .then(async ({ savedOrder, createdGiftCards, createdBookingIds }) => {
        if (rewardResolution.applications.length > 0) {
          await this.commitRewards(
            savedOrder.id,
            rewardReservationRef,
            rewardResolution.applications,
          );
        }

        // Post-commit side effects: dispatch emails & notifications asynchronously
        for (const gc of createdGiftCards) {
          if (gc.deliveryStatus !== GiftCardDeliveryStatus.PENDING) {
            this.giftCardService.sendGiftCardEmail(gc.id).catch((err) => {
              this.logger.error(
                `Failed to send gift card email for ${gc.id}: ${err.message}`,
              );
            });
          }
        }

        for (const bookingId of createdBookingIds) {
          this.bookingService
            .sendBookingNotifications(bookingId)
            .catch((err) => {
              this.logger.error(
                `Failed to send booking notifications for ${bookingId}: ${err.message}`,
              );
            });
        }

        return savedOrder;
      })
      .catch(async (dbErr) => {
        // Order creation failed after rewards were reserved → release them.
        if (rewardResolution.applications.length > 0 && rewardReservationRef) {
          await this.releaseRewards(
            rewardResolution.applications,
            rewardReservationRef,
            'checkout_db_failure',
          );
        }

        // Compensating refund: the order failed AFTER money moved (wallet
        // charge or card/PayPal capture). Refund so the customer is never
        // charged for a failed order. MCOM Pay refunds are idempotent per
        // charge + amount.
        const refundReference =
          paidChargeId ||
          walletTransactionId ||
          createCheckoutDto.payment.transactionId;
        if (finalAmount > 0 && refundReference) {
          try {
            await this.paymentProviderService.refundStripePayment(
              refundReference,
              Number(finalAmount.toFixed(2)),
            );
          } catch (refundErr) {
            this.logger.error(
              '[order.checkout] compensating MCOM Pay refund failed — manual reconciliation required',
              refundErr,
            );
          }
        }
        throw dbErr;
      });

    // Consumption callbacks are queued only after the order transaction has
    // committed, so a rolled-back checkout can never report a false redeem.
    await this.enqueueInstrumentCallbacks({
      giftCard: giftCardAmountToApply > 0 ? appliedGiftCard : null,
      voucher: voucherAmountToApply > 0 ? appliedVoucher : null,
      coupon: couponAmountToApply > 0 ? appliedCoupon : null,
      amounts: {
        giftCard: giftCardAmountToApply,
        voucher: voucherAmountToApply,
        coupon: couponAmountToApply,
      },
      orderId: savedOrder.id,
    });

    return savedOrder;
  }

  private async enqueueInstrumentCallbacks(input: {
    giftCard: { id: string; code: string; issuanceId: string | null } | null;
    voucher: { id: string; code: string; issuanceId: string | null } | null;
    coupon: { id: string; code: string; issuanceId: string | null } | null;
    amounts: { giftCard: number; voucher: number; coupon: number };
    orderId: string;
  }): Promise<void> {
    const jobs: Array<{
      issuanceId: string;
      code: string;
      instrumentType: InstrumentType;
      instrumentId: string;
      amount: number;
      note: string;
    }> = [];

    if (input.giftCard?.issuanceId) {
      jobs.push({
        issuanceId: input.giftCard.issuanceId,
        code: input.giftCard.code,
        instrumentType: InstrumentType.GIFT_CARD,
        instrumentId: input.giftCard.id,
        amount: input.amounts.giftCard,
        note: `order:${input.orderId}:gift_card`,
      });
    }
    if (input.voucher?.issuanceId) {
      jobs.push({
        issuanceId: input.voucher.issuanceId,
        code: input.voucher.code,
        instrumentType: InstrumentType.VOUCHER,
        instrumentId: input.voucher.id,
        amount: input.amounts.voucher,
        note: `order:${input.orderId}:voucher`,
      });
    }
    if (input.coupon?.issuanceId) {
      jobs.push({
        issuanceId: input.coupon.issuanceId,
        code: input.coupon.code,
        instrumentType: InstrumentType.COUPON,
        instrumentId: input.coupon.id,
        amount: input.amounts.coupon,
        note: `order:${input.orderId}:coupon`,
      });
    }

    for (const job of jobs) {
      try {
        await this.partnerCallbacks.enqueueRedeem(job);
      } catch (err: any) {
        this.logger.warn(
          `Failed to enqueue reward callback for issuance ${job.issuanceId}: ${err?.message}`,
        );
      }
    }
  }

  /**
   * Validate the caller's selected reward applications against the freshly
   * fetched issuances and the cart lines, returning the authoritative
   * per-line discount. Throws BadRequestException on any inconsistency.
   */
  private buildCheckoutScopeLines(params: {
    isDirectPurchase: boolean;
    directPurchaseProduct: Product | null;
    directPurchase?: { productId: string; quantity: number; variant?: Record<string, string>; selectedVariants?: Record<string, string> };
    isCartCheckout: boolean;
    cart: any;
    rewardApplications: AppliedReward[];
  }): ScopeLine[] {
    const rewardByLine = new Map(
      (params.rewardApplications || []).map((app) => [
        app.lineKey,
        Number(app.discountAmount) || 0,
      ]),
    );
    const scopeLines: ScopeLine[] = [];

    if (params.isDirectPurchase && params.directPurchaseProduct && params.directPurchase) {
      const product = params.directPurchaseProduct;
      const price = this.productService.calculatePrice(
        product,
        params.directPurchase.variant ||
          params.directPurchase.selectedVariants ||
          {},
      );
      const quantity = params.directPurchase.quantity;
      scopeLines.push({
        lineKey: `product:${product.id}`,
        kind: 'product',
        id: product.id,
        businessId:
          (product as any).businessId ?? (product as any).business?.id ?? null,
        unitPrice: price,
        quantity,
        lineTotal: round2(price * quantity),
        discount: rewardByLine.get(`product:${product.id}`) ?? 0,
      });
    } else if (params.isCartCheckout) {
      for (const cartItem of params.cart.items) {
        const price = this.productService.calculatePrice(
          cartItem.product,
          cartItem.selectedVariants || {},
        );
        const lineTotal = round2(price * cartItem.quantity);
        scopeLines.push({
          lineKey: `product:${cartItem.product.id}`,
          kind: 'product',
          id: cartItem.product.id,
          businessId:
            (cartItem.product as any).businessId ??
            (cartItem.product as any).business?.id ??
            null,
          unitPrice: price,
          quantity: cartItem.quantity,
          lineTotal,
          discount: rewardByLine.get(`product:${cartItem.product.id}`) ?? 0,
        });
      }
    }
    return scopeLines;
  }

  private async resolveRewardApplications(
    userId: string,
    rawApplications: { issuanceId: string; lineKey: string }[] | undefined,
    lines: EligibilityLine[],
  ): Promise<{ applications: AppliedReward[]; total: number }> {
    if (!rawApplications || rawApplications.length === 0) {
      return { applications: [], total: 0 };
    }

    if (!this.rewardsClient.isEnabled()) {
      throw new BadRequestException(
        'Reward redemption is not available right now. Please try again later.',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'centralUserId'],
    });
    if (!user?.centralUserId) {
      throw new BadRequestException(
        'Link your MCOM account (SSO) to use earned rewards.',
      );
    }

    let issuances;
    try {
      const result = await this.rewardsClient.listUserIssuances(
        user.centralUserId,
        { status: 'ISSUED', limit: 100 },
      );
      issuances = result.data;
    } catch {
      throw new BadRequestException(
        'Could not verify your rewards with MCOM Rewards. Please try again.',
      );
    }

    const eligible = this.rewardsIntegrationService.evaluateIssuances(
      issuances,
      lines,
    );
    const eligibleById = new Map(eligible.map((e) => [e.issuanceId, e]));
    const lineByKey = new Map(lines.map((l) => [l.lineKey, l]));

    const applications: AppliedReward[] = [];
    const usedIssuances = new Set<string>();
    const usedLines = new Set<string>();

    for (const app of rawApplications) {
      const reward = eligibleById.get(app.issuanceId);
      if (!reward) {
        throw new BadRequestException(
          'One of the selected rewards is no longer valid for this order.',
        );
      }
      if (usedIssuances.has(app.issuanceId)) {
        throw new BadRequestException(
          'The same reward cannot be applied twice.',
        );
      }
      if (usedLines.has(app.lineKey)) {
        throw new BadRequestException('Only one reward can be applied per item.');
      }

      const match = reward.applicableLines.find(
        (l) => l.lineKey === app.lineKey,
      );
      const line = lineByKey.get(app.lineKey);
      if (!match || !line) {
        throw new BadRequestException(
          'One of the selected rewards does not apply to the chosen item.',
        );
      }
      if (line.kind !== 'PRODUCT') {
        throw new BadRequestException(
          'Service rewards are not yet supported at checkout.',
        );
      }

      usedIssuances.add(app.issuanceId);
      usedLines.add(app.lineKey);

      const issuance = issuances.find((i) => i.id === app.issuanceId);
      applications.push({
        issuanceId: app.issuanceId,
        lineKey: app.lineKey,
        targetType: RewardTargetType.PRODUCT,
        targetId: line.id,
        discountAmount: match.discountAmount,
        rewardType: issuance?.rewardType ?? undefined,
        issuerClientId: issuance?.issuerClientId,
        code: issuance?.code ?? null,
      });
    }

    const total = applications.reduce((sum, a) => sum + a.discountAmount, 0);
    return {
      applications,
      total: Math.round((total + Number.EPSILON) * 100) / 100,
    };
  }

  private async reserveRewards(
    applications: AppliedReward[],
    reservationRef: string,
  ): Promise<void> {
    for (const app of applications) {
      try {
        await this.rewardsClient.reserveIssuance(app.issuanceId, {
          orderRef: reservationRef,
          idempotencyKey: `${reservationRef}:${app.issuanceId}`,
          metadata: {
            discountAmount: app.discountAmount,
            targetId: app.targetId,
          },
        });
      } catch (err: any) {
        throw new BadRequestException(
          `Could not reserve reward "${app.issuanceId}": ${err?.message || err}`,
        );
      }
    }
  }

  private async commitRewards(
    orderId: string,
    reservationRef: string | null,
    applications: AppliedReward[],
  ): Promise<void> {
    for (const app of applications) {
      try {
        await this.rewardsClient.commitIssuance(app.issuanceId, {
          orderRef: reservationRef || orderId,
        });
        await this.orderItemRewardRepository.update(
          { orderId, rewardIssuanceId: app.issuanceId },
          {
            status: RewardRedemptionStatus.COMMITTED,
            committedAt: new Date(),
          },
        );
      } catch (err: any) {
        this.logger.error(
          `[order.checkout] reward commit failed for ${app.issuanceId} — queued`,
          err,
        );
        await this.rewardReconcileService.enqueue({
          rewardIssuanceId: app.issuanceId,
          orderId,
          reservationRef: reservationRef || undefined,
          operation: RewardOutboxOperation.COMMIT,
          failureReason: String(err?.message || err),
        });
      }
    }
  }

  private async releaseRewards(
    applications: AppliedReward[],
    reservationRef: string,
    reason: string,
  ): Promise<void> {
    for (const app of applications) {
      try {
        await this.rewardsClient.releaseIssuance(app.issuanceId, {
          orderRef: reservationRef,
          reason,
        });
      } catch (err: any) {
        this.logger.warn(
          `[order.checkout] reward release failed for ${app.issuanceId}: ${err?.message || err}`,
        );
        await this.rewardReconcileService.enqueue({
          rewardIssuanceId: app.issuanceId,
          reservationRef,
          operation: RewardOutboxOperation.RELEASE,
          failureReason: String(err?.message || err),
        });
      }
    }
  }

  async getOrdersForCustomer(
    customerId: string,
    pagination: PaginationQueryDto,
  ): Promise<PageDto<Order>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.orderRepository.findAndCount({
      where: { user: { id: customerId } },
      relations: ['items', 'items.product', 'rewardRedemptions'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const pageMetaDto = new PageMetaDto({
      itemCount: items.length,
      totalItems: total,
      pageOptionsDto: pagination as any,
    });

    return new PageDto(items, pageMetaDto);
  }

  async getOrdersForOwner(
    ownerId: string,
    pagination: PaginationQueryDto,
  ): Promise<PageDto<Order>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'customer')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('order.rewardRedemptions', 'rewardRedemption')
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

  async getOrdersForAdmin(
    pagination: PaginationQueryDto,
  ): Promise<PageDto<Order>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.orderRepository.findAndCount({
      relations: [
        'user',
        'items',
        'items.product',
        'items.product.business',
        'rewardRedemptions',
      ],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

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
      .select('SUM(order.total) / 100.0', 'totalSales')
      .addSelect('COUNT(DISTINCT order.id)', 'orders')
      .addSelect('SUM(item.quantity)', 'productsSold')
      .where('user.id = :ownerId', { ownerId })
      .getRawOne();

    const totalSales = parseFloat(stats.totalSales) || 0;
    const productsSold = parseInt(stats.productsSold) || 0;
    const orderCount = parseInt(stats.orders) || 0;

    // Reward discounts absorbed by this owner's products (committed only).
    const rewardStats = await this.orderItemRewardRepository
      .createQueryBuilder('reward')
      .leftJoin('reward.orderItem', 'orderItem')
      .leftJoin('orderItem.product', 'rewardProduct')
      .leftJoin('rewardProduct.business', 'rewardBusiness')
      .leftJoin('rewardBusiness.user', 'rewardOwner')
      .select('COALESCE(SUM(reward.discountAmount) / 100.0, 0)', 'rewardDiscountTotal')
      .where('rewardOwner.id = :ownerId', { ownerId })
      .andWhere('reward.status = :status', {
        status: RewardRedemptionStatus.COMMITTED,
      })
      .getRawOne();
    const rewardDiscountTotal =
      parseFloat(rewardStats?.rewardDiscountTotal) || 0;

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
      rewardDiscountTotal,
    };
  }

  async getSalesStatsForCustomer(
    customerId: string,
  ): Promise<{ totalOrders: number; totalSpent: number }> {
    const stats = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total) / 100.0', 'totalSpent')
      .addSelect('COUNT(order.id)', 'totalOrders')
      .where('order.userId = :customerId', { customerId })
      .getRawOne();

    const totalOrders = parseInt(stats.totalOrders) || 0;
    const totalSpent = parseFloat(stats.totalSpent) || 0;

    return { totalOrders, totalSpent };
  }

  async updateOrderTracking(
    orderId: string,
    dto: UpdateOrderTrackingDto,
    requester: { id: string; role?: string },
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: [
        'business',
        'business.user',
        'items',
        'items.product',
        'items.product.business',
        'items.product.business.user',
      ],
    });
    if (!order) throw new NotFoundException('Order not found');

    const isAdmin = requester.role === UserRole.ADMIN;
    if (!isAdmin) {
      // Owners may only update tracking for orders containing their products.
      const ownerId = requester.id;
      const ownsOrder =
        (order as any)?.business?.user?.id === ownerId ||
        (order.items || []).some(
          (item: any) => item?.product?.business?.user?.id === ownerId,
        );
      // Fall back to direct business relation check via items' product business.
      if (!ownsOrder) {
        const items = await this.orderItemRepository.find({
          where: { order: { id: orderId } },
          relations: ['product', 'product.business', 'product.business.user'],
        });
        const ownsViaItems = items.some(
          (item: any) => item?.product?.business?.user?.id === ownerId,
        );
        if (!ownsViaItems) {
          throw new ForbiddenException(
            'You are not authorized to update tracking for this order.',
          );
        }
      }
    }

    if (dto.trackingNumber !== undefined)
      order.trackingNumber = dto.trackingNumber;
    if (dto.carrierCode !== undefined) order.carrierCode = dto.carrierCode;
    return this.orderRepository.save(order);
  }
}

function round2(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}
