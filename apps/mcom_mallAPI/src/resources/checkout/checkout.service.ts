import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
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
import { InitiateCheckoutDto } from './dto/initiate-checkout.dto';
import { GiftCardService } from '../gift-card/gift-card.service';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { McomWalletService } from '../payments/services/mcom-wallet.service';
import { PaymentMethod } from '../order/entities/order-payment.entity';
import { OrderStatus } from '../order/enums/order-status.enum';
import { CompleteCheckoutDto } from './dto/complete-checkout.dto';
import { RedeemGiftCardDto } from '../gift-card/dto/redeem-gift-card.dto';
import { CouponService } from '../coupon/coupon.service';
import { ShippingAddress } from '../shipping-address/entities/shipping-address.entity';
import {
  ShippingItemInput,
  ShippingPricingService,
} from '../shipping/shipping-pricing.service';
import { InstrumentScopeService, round2 } from '../partner-instruments/instrument-scope.service';
import {
  InstrumentType,
  ScopeLine,
  ScopeMode,
} from '../partner-instruments/enums';
import {
  computeCouponDiscount,
  computeInstrumentApplication,
} from '../partner-instruments/pricing';
import { VoucherService } from '../voucher/voucher.service';
import { VoucherStatus } from '../voucher/entities/voucher.entity';

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
    @InjectRepository(ShippingAddress)
    private readonly shippingAddressRepository: Repository<ShippingAddress>,
    private readonly giftCardService: GiftCardService,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly mcomWalletService: McomWalletService,
    private readonly dataSource: DataSource,
    private readonly productService: ProductService,
    private readonly couponService: CouponService,
    private readonly shippingPricingService: ShippingPricingService,
    private readonly instrumentScopeService: InstrumentScopeService,
    private readonly voucherService: VoucherService,
  ) {}

  async initiateCheckout(
    userId: string,
    initiateCheckoutDto: InitiateCheckoutDto,
  ) {
    const {
      items,
      giftCardCode,
      giftCardAmount,
      couponCode,
      voucherCode,
      voucherAmount,
      shippingAddressId,
      carrierCode,
    } = initiateCheckoutDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let shippingAddress: ShippingAddress | null = null;
    if (shippingAddressId) {
      shippingAddress = await this.shippingAddressRepository.findOne({
        where: { id: shippingAddressId, user: { id: userId } },
      });
      if (!shippingAddress) {
        throw new NotFoundException('Shipping address not found');
      }
    }

    const productIds = items.map((item) => item.productId);
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['business', 'business.user'],
    });

    // Ensure all products exist
    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found.');
    }

    // Early stock guard so a payment intent is not created for unavailable
    // stock. The authoritative compare-and-set happens in completeCheckout.
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product?.enableStockManagement && product.stock < item.quantity) {
        throw new ConflictException(
          `Insufficient stock for product "${product.title}". Requested: ${item.quantity}, Available: ${product.stock}.`,
        );
      }
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

    // Canonical line list used by the shared instrument-scope matcher. The
    // same service is used by booking, so product checkout and booking cannot
    // drift on scope semantics.
    const scopeLines: ScopeLine[] = orderItems.map((item, index) => ({
      lineKey: `product:${item.product.id}:${index}`,
      kind: 'product',
      id: item.product.id,
      businessId: item.product.business?.id ?? null,
      unitPrice: round2(Number(item.price)),
      quantity: item.quantity,
      lineTotal: round2(Number(item.price) * item.quantity),
    }));
    const itemSubtotalForInstruments = round2(
      scopeLines.reduce((sum, line) => sum + line.lineTotal, 0),
    );

    // Apply Coupon if provided (scope-aware)
    let couponDiscount = 0;
    let couponEligibleSubtotal: number | null = null;
    let couponScopeMode: ScopeMode = ScopeMode.NO_SCOPE;
    if (couponCode) {
      const coupon = await this.couponService.validateCoupon(couponCode, user);
      const couponScope = await this.instrumentScopeService.getEffectiveScope(
        InstrumentType.COUPON,
        { id: coupon.id, businessId: coupon.business?.id ?? null },
      );
      const isScoped =
        !!couponScope && couponScope.scopeMode !== ScopeMode.NO_SCOPE;
      couponScopeMode = couponScope?.scopeMode ?? ScopeMode.NO_SCOPE;

      let base = subtotal;
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
        base = couponEligibleSubtotal;
      }

      couponDiscount = computeCouponDiscount({
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        base,
        maxDiscount: Number((coupon as any).maxDiscount),
      });
    }

    const totalAfterCoupon = Math.max(0, subtotal - couponDiscount);

    // Dynamic Shipping Fee Calculation (Royal Mail pricing API with DB fallback)
    let estimatedShippingFee = 0;
    if (carrierCode) {
      const shippingItems: ShippingItemInput[] = orderItems.map((item) => ({
        quantity: item.quantity,
        weightKg: item.product.weight,
        lengthCm: item.product.length,
        widthCm: item.product.width,
        heightCm: item.product.height,
      }));
      const shippingQuote = await this.shippingPricingService.getShippingFee(
        carrierCode,
        shippingItems,
        shippingAddress?.postalCode,
      );
      estimatedShippingFee = shippingQuote.fee;

      // Apply free shipping threshold for Royal Mail Tracked 48
      if (carrierCode === 'royalmail' && totalAfterCoupon >= 50) {
        estimatedShippingFee = 0;
      }
    }

    const totalWithShipping = round2(
      totalAfterCoupon + estimatedShippingFee,
    );

    // Apply gift card if provided (scope-aware)
    let giftCardAmountToApply = 0;
    if (giftCardCode) {
      const giftCard = await this.giftCardService.findActiveCardByCode(
        giftCardCode,
      );
      const balance = round2(Number(giftCard.currentBalance));
      const bindingBusinessId =
        await this.giftCardService.getBusinessBinding(giftCard);
      const giftCardScope =
        await this.instrumentScopeService.getEffectiveScope(
          InstrumentType.GIFT_CARD,
          {
            id: giftCard.id,
            businessId: bindingBusinessId,
          },
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
      giftCardAmountToApply = computeInstrumentApplication({
        requested: giftCardAmount,
        balance,
        eligiblePayable: isScoped ? eligible.eligibleSubtotal : totalWithShipping,
        remainingPayable: totalWithShipping,
      });
    }

    const totalAfterGiftCard = round2(
      totalWithShipping - giftCardAmountToApply,
    );

    // Apply voucher if provided (scope-aware, spend-like balance)
    let voucherAmountToApply = 0;
    if (voucherCode) {
      const voucher = await this.voucherService.findVoucherByCode(voucherCode);
      if (
        voucher.status === VoucherStatus.REDEEMED ||
        voucher.status === VoucherStatus.DISABLED ||
        (voucher.expiresAt && new Date() > voucher.expiresAt)
      ) {
        throw new BadRequestException('Voucher is invalid or expired.');
      }
      if ((voucher.voucherProduct as any)?.usage === 'instore_only') {
        throw new BadRequestException(
          'This voucher can only be redeemed in store.',
        );
      }
      const balance = round2(Number(voucher.balance));
      const voucherScope =
        await this.instrumentScopeService.getEffectiveScope(
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
      voucherAmountToApply = computeInstrumentApplication({
        requested: voucherAmount,
        balance,
        eligiblePayable: isScoped
          ? eligible.eligibleSubtotal
          : totalAfterGiftCard,
        remainingPayable: totalAfterGiftCard,
      });
    }

    const remainingTotal = round2(
      totalWithShipping - giftCardAmountToApply - voucherAmountToApply,
    );

    // Create pending order in a transaction
    const newOrder = await this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);

      const order = orderRepo.create({
        user: { id: userId } as User,
        total: subtotal + estimatedShippingFee,
        items: [],
        status: OrderStatus.PENDING,
        giftCardAmountApplied: giftCardAmountToApply,
        giftCardCode: giftCardAmountToApply > 0 ? giftCardCode : null,
        couponCode: couponDiscount > 0 ? couponCode : null,
        couponDiscountApplied: couponDiscount,
        voucherCode: voucherAmountToApply > 0 ? voucherCode : null,
        voucherAmountApplied: voucherAmountToApply,
        shippingAddress,
        carrierCode,
        estimatedShippingFee,
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
      // Prefer centralized MCOM Wallet holds when enabled and linked.
      const centralUserId = (user as any)?.centralUserId as string | undefined;
      if (centralUserId && this.mcomWalletService.isEnabled()) {
        try {
          const hold = await this.mcomWalletService.placeHold({
            userId: centralUserId,
            amount: Number(remainingTotal.toFixed(2)),
            reference: `mall-checkout-${newOrder.id}`,
            metadata: { platform: 'mcom-mall', orderId: newOrder.id },
            idempotencyKey: this.mcomWalletService.buildKey(
              'hold',
              newOrder.id,
            ),
          });
          return {
            orderId: newOrder.id,
            holdId: hold.holdId,
            expiresAt: hold.expiresAt,
            paymentRequired: true,
            paymentMethod: PaymentMethod.MCOM_WALLET,
            remainingTotal,
          };
        } catch (err: any) {
          throw this.mcomWalletService.toHttpException(err);
        }
      }
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
    const { orderId, transactionId, paymentProvider, holdId } =
      completeCheckoutDto;
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId }, status: OrderStatus.PENDING },
    });

    if (!order) {
      throw new NotFoundException('Pending order not found.');
    }

    const remainingTotal =
      order.total -
      (order.giftCardAmountApplied || 0) -
      (order.couponDiscountApplied || 0) -
      (order.voucherAmountApplied || 0);

    // Verify payment if one was made
    if (remainingTotal > 0) {
      const walletHoldId =
        holdId ||
        (paymentProvider === PaymentMethod.MCOM_WALLET
          ? transactionId
          : undefined);
      if (walletHoldId) {
        // Centralized wallet path: convert the pre-authorization hold into a
        // real debit. Uncaptured holds auto-expire (~24h) as a backstop.
        try {
          await this.mcomWalletService.captureHold({
            holdId: walletHoldId,
            amount: Number(remainingTotal.toFixed(2)),
            reference: `mall-checkout-${orderId}`,
            idempotencyKey: this.mcomWalletService.buildKey('capture', orderId),
          });
        } catch (err: any) {
          order.status = OrderStatus.FAILED;
          await this.orderRepository.save(order);
          throw this.mcomWalletService.toHttpException(err);
        }
      } else {
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
    }

    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);

      // Lock the order row only. Postgres cannot apply `FOR UPDATE` to the
      // nullable side of an outer join, which is what `relations: ['user']`
      // produces here. Ownership was already verified above, and order
      // ownership never changes, so locking by id is sufficient.
      const lockedOrder = await orderRepo.findOne({
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedOrder || lockedOrder.status !== OrderStatus.PENDING) {
        throw new BadRequestException(
          'Pending order not found or already processed.',
        );
      }

      // Redemption helpers authorise against `order.user`; we intentionally
      // locked only the order row (see above), so attach the already-verified
      // caller identity without joining.
      lockedOrder.user = { id: userId } as User;

      // Decrement stock with a compare-and-set so concurrent checkouts cannot
      // oversell. Runs in the same transaction as the order status change.
      const orderItemsForStock = await orderRepo.findOne({
        where: { id: lockedOrder.id },
        relations: ['items', 'items.product'],
      });
      for (const item of orderItemsForStock?.items ?? []) {
        if (item.product?.enableStockManagement) {
          const stockUpdate = await manager
            .createQueryBuilder()
            .update(Product)
            .set({ stock: () => `stock - ${Number(item.quantity)}` })
            .where(
              'id = :id AND stock >= :qty AND enableStockManagement = true',
              { id: item.product.id, qty: item.quantity },
            )
            .execute();
          if (stockUpdate.affected === 0) {
            throw new ConflictException(
              `Insufficient stock for product "${item.product.title}".`,
            );
          }
        }
      }

      // Redeem gift card
      if (lockedOrder.giftCardCode && lockedOrder.giftCardAmountApplied > 0) {
        const redeemDto: RedeemGiftCardDto = {
          code: lockedOrder.giftCardCode,
          amount: round2(Number(lockedOrder.giftCardAmountApplied)),
        };

        // Fetch order items to get a potential business ID for non-system gift cards
        const orderWithItems = await orderRepo.findOne({
          where: { id: lockedOrder.id },
          relations: ['items', 'items.product', 'items.product.business'],
        });

        const businessId =
          orderWithItems?.items?.length > 0
            ? orderWithItems.items[0].product.business.id
            : undefined;
        await this.giftCardService.redeem(
          redeemDto,
          lockedOrder,
          businessId,
          manager,
        );
      }

      // Redeem Coupon (join the same transaction so it commits/rolls back with the order)
      if (lockedOrder.couponCode && lockedOrder.couponDiscountApplied > 0) {
        await this.couponService.redeemForOrder(
          {
            code: lockedOrder.couponCode,
            amount: Number(lockedOrder.couponDiscountApplied),
          },
          lockedOrder,
          manager,
        );
      }

      // Redeem Voucher (same transaction, after coupon/gift card)
      if (lockedOrder.voucherCode && lockedOrder.voucherAmountApplied > 0) {
        await this.voucherService.redeemForOrder(
          {
            code: lockedOrder.voucherCode,
            amount: round2(Number(lockedOrder.voucherAmountApplied)),
          },
          lockedOrder,
          manager,
        );
      }

      lockedOrder.status = OrderStatus.COMPLETED;
      return await orderRepo.save(lockedOrder);
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
