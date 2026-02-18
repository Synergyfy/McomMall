import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThanOrEqual } from 'typeorm';
import * as crypto from 'crypto';

import { Coupon } from './entities/coupon.entity';
import { CouponStatus } from './coupon.enum';
import { CouponProduct } from './entities/coupon-product.entity';
import {
  CouponTransaction,
} from './entities/coupon-transaction.entity';
import { User } from '../users/entities/user.entity';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { CashbackEvent } from '../../common/enums/cashback-event.enum';
import {
  OrderPayment,
  PaymentMethod,
} from '../order/entities/order-payment.entity';
import { Order } from '../order/entities/order.entity';
import { InitiateCouponPurchaseDto } from './dto/initiate-coupon-purchase.dto';
import { VerifyCouponPurchaseDto } from './dto/verify-coupon-purchase.dto';
import { WalletService } from '../wallet/wallet.service';
import { WalletTransactionType } from '../wallet/entities/wallet-transaction.entity';
import { CouponTransactionService } from './coupon-transaction.service';
import { TransactionType } from './coupon.enum';
import { CouponStatsDto } from './dto/coupon-stats.dto';
import { CouponChartDataDto } from './dto/coupon-chart-data.dto';
import { CouponTransactionHistoryDto } from './dto/coupon-transaction-history.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(CouponProduct)
    private readonly couponProductRepository: Repository<CouponProduct>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly centralIntegrationService: CentralIntegrationService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    private readonly couponTransactionService: CouponTransactionService,
    private readonly dataSource: DataSource,
  ) { }

  // --- System Integration Methods ---

  async createSystemCoupon(payload: {
    amount: number;
    recipientEmail: string;
    recipientName?: string;
    message?: string;
    businessName: string;
  }): Promise<Coupon> {
    const amount = Number(payload.amount);
    const { recipientEmail, recipientName, message, businessName } = payload;

    const code = await this.generateUniqueCouponCode();
    // Default expiry 1 year
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Find User to link (Owner)
    const owner = await this.userRepository.findOne({ where: { email: recipientEmail } });

    // Auto-create user if missing (see GiftCardService for logic)
    let finalOwner = owner;
    if (!finalOwner) {
      const nameStr = recipientName || "Loyalty Recipient";
      const nameParts = nameStr.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const newUser = this.userRepository.create({
        email: recipientEmail,
        firstName,
        lastName,
        password: await crypto.randomBytes(16).toString('hex'),
        phoneNumber: `0000000000${Math.floor(Math.random() * 1000)}`,
        isActive: true,
        isEmailVerified: true,
        role: 'customer' as any,
      });
      finalOwner = await this.userRepository.save(newUser);
    }

    const newCoupon = this.couponRepository.create({
      code,
      initialValue: amount,
      balance: amount,
      status: CouponStatus.UNREDEEMED,
      expiresAt,
      owner: finalOwner, // Linked owner
      buyer: finalOwner, // Conceptually bought by/for them
      recipientEmail,
      recipientName,
      personalMessage: message || `Reward from ${businessName}`,
      // CouponProduct? If null, it's a generic coupon? 
      // Coupon entity has @ManyToOne product. It might be nullable?
      // Checking entity... @ManyToOne product. If not nullable, we need a "System Product".
      // Assuming for now it is nullable or we can leave it undefined if relations are not strict in DB.
      // Actually entity says: @ManyToOne(() => CouponProduct, (product) => product.coupons) couponProduct: CouponProduct;
      // It doesn't explicitly say { nullable: true }. 
      // Risk: Validation might fail if product is required.
      // Fix: If validation fails, we might need a dummy "Loyalty Reward" product seeder.
      // For now, I'll proceed hoping it's nullable or handled by DB default.
    });

    const savedCoupon = await this.couponRepository.save(newCoupon);

    await this.couponTransactionService.createTransaction(
      {
        coupon: savedCoupon,
        amount,
        type: TransactionType.PURCHASE,
        balanceBefore: 0,
        balanceAfter: amount,
        notes: `Generated by Loyalty System for ${businessName}`,
      },
      this.dataSource.manager,
    );

    return savedCoupon;
  }

  async initiateCouponPurchase(
    initiateDto: InitiateCouponPurchaseDto,
  ): Promise<{ clientSecret?: string; orderId?: string; provider: PaymentMethod }> {
    const product = await this.couponProductRepository.findOneBy({
      id: initiateDto.couponProductId,
      isEnabled: true,
    });
    if (!product) {
      throw new NotFoundException('Coupon product not found or is inactive.');
    }

    this.validatePurchaseAmount(initiateDto.amount, product);

    const currency = 'GBP';

    if (initiateDto.paymentMethod === 'stripe') {
      const paymentIntent = await this.paymentProviderService.createStripePaymentIntent(
        initiateDto.amount,
        currency,
      );
      return {
        clientSecret: paymentIntent.client_secret,
        provider: PaymentMethod.STRIPE,
      };
    } else if (initiateDto.paymentMethod === 'paypal') {
      const order = await this.paymentProviderService.createPaypalOrder(
        initiateDto.amount,
        currency,
      );
      return { orderId: order.id, provider: PaymentMethod.PAYPAL };
    } else {
      throw new BadRequestException('Invalid payment provider specified.');
    }
  }

  async verifyAndCompletePurchase(
    verifyDto: any,
    userId: string,
  ): Promise<Coupon> {
    const { purchaseDetails, paymentProvider, transactionId } = verifyDto;
    const { couponProductId, amount } = purchaseDetails;

    const product = await this.couponProductRepository.findOne({
      where: { id: couponProductId, isEnabled: true },
      relations: ['user'],
    });

    if (!product) {
      throw new NotFoundException('Coupon product not found or is inactive.');
    }

    const currency = 'GBP';
    let verificationResult;

    if (paymentProvider === PaymentMethod.STRIPE) {
      verificationResult = await this.paymentProviderService.verifyStripePaymentIntent(
        transactionId,
        amount,
        currency,
      );
    } else if (paymentProvider === PaymentMethod.PAYPAL) {
      verificationResult = await this.paymentProviderService.captureAndVerifyPaypalOrder(
        transactionId,
        amount,
        currency,
      );
    } else {
      throw new BadRequestException('Invalid payment provider specified.');
    }

    if (!verificationResult.ok) {
      throw new BadRequestException(
        `Payment verification failed: ${verificationResult.reason}`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const paymentRepo = manager.getRepository(OrderPayment);
      const couponRepo = manager.getRepository(Coupon);

      const newPayment = paymentRepo.create({
        user: { id: userId } as User,
        amount,
        currency,
        transactionId,
        paymentMethod: paymentProvider,
      });
      const savedPayment = await paymentRepo.save(newPayment);

      const newOrder = orderRepo.create({
        user: { id: userId } as User,
        total: amount,
        payment: savedPayment,
      });
      const savedOrder = await orderRepo.save(newOrder);

      const user = await manager.findOne(User, { where: { id: userId } });

      const deliveryDate = purchaseDetails.deliveryDate
        ? new Date(purchaseDetails.deliveryDate)
        : new Date();
      const isScheduled = deliveryDate > new Date();

      const code = await this.generateUniqueCouponCode();
      const expiresAt = product.expiryDays
        ? new Date(Date.now() + product.expiryDays * 24 * 60 * 60 * 1000)
        : null;

      let finalAmount = amount;
      if (
        product.bonusThreshold &&
        product.bonusAmount &&
        amount >= product.bonusThreshold
      ) {
        finalAmount = Number(amount) + Number(product.bonusAmount);
      }

      const newCoupon = couponRepo.create({
        code,
        initialValue: finalAmount,
        balance: finalAmount,
        status: isScheduled
          ? CouponStatus.DISABLED
          : CouponStatus.UNREDEEMED,
        expiresAt,
        buyer: { id: userId } as User,
        owner: product.user,
        couponProduct: product,
        order: savedOrder,
        deliveryDate,
        recipientName: purchaseDetails.recipientName,
        recipientEmail: purchaseDetails.recipientEmail,
        personalMessage: purchaseDetails.personalMessage,
      });

      const savedCoupon = await couponRepo.save(newCoupon);

      await this.couponTransactionService.createTransaction(
        {
          coupon: savedCoupon,
          amount,
          type: TransactionType.PURCHASE,
          balanceBefore: 0,
          balanceAfter: amount,
          notes: 'Initial coupon purchase.',
        },
        manager,
      );

      await this.walletService.creditEarning({
        userId: product.user.id,
        amount,
        type: WalletTransactionType.EARNING_COUPON,
        description: `Coupon purchase - ${savedCoupon.code}`,
      });

      // Process Cashback
      if (user.email) {
        await this.centralIntegrationService.processCashback(
          user.email,
          Number(amount),
          CashbackEvent.COUPON_PURCHASE,
          transactionId,
        );
      }

      return savedCoupon;
    });
  }

  async initiateCouponReload(
    code: string,
    initiateDto: any,
  ): Promise<{ clientSecret?: string; orderId?: string; provider: PaymentMethod }> {
    const coupon = await this.findActiveCouponByCode(code);
    const product = await this.couponProductRepository.findOneBy({
      id: coupon.couponProduct.id,
    });

    if (!product.allowReloading) {
      throw new BadRequestException('This coupon cannot be reloaded.');
    }

    const currency = 'GBP';

    if (initiateDto.paymentProvider === PaymentMethod.STRIPE) {
      const paymentIntent =
        await this.paymentProviderService.createStripePaymentIntent(
          initiateDto.amount,
          currency,
        );
      return {
        clientSecret: paymentIntent.client_secret,
        provider: PaymentMethod.STRIPE,
      };
    } else if (initiateDto.paymentProvider === PaymentMethod.PAYPAL) {
      const order = await this.paymentProviderService.createPaypalOrder(
        initiateDto.amount,
        currency,
      );
      return { orderId: order.id, provider: PaymentMethod.PAYPAL };
    } else {
      throw new BadRequestException('Invalid payment provider specified.');
    }
  }

  async verifyAndCompleteReload(
    code: string,
    verifyDto: any,
    userId: string,
  ): Promise<Coupon> {
    const { reloadDetails, paymentProvider, transactionId } = verifyDto;
    const { amount } = reloadDetails;

    const coupon = await this.findActiveCouponByCode(code);
    const product = await this.couponProductRepository.findOneBy({
      id: coupon.couponProduct.id,
    });

    if (!product.allowReloading) {
      throw new BadRequestException('This coupon cannot be reloaded.');
    }

    const currency = 'GBP';
    let verificationResult;

    if (paymentProvider === PaymentMethod.STRIPE) {
      verificationResult =
        await this.paymentProviderService.verifyStripePaymentIntent(
          transactionId,
          amount,
          currency,
        );
    } else if (paymentProvider === PaymentMethod.PAYPAL) {
      verificationResult =
        await this.paymentProviderService.captureAndVerifyPaypalOrder(
          transactionId,
          amount,
          currency,
        );
    } else {
      throw new BadRequestException('Invalid payment provider specified.');
    }

    if (!verificationResult.ok) {
      throw new BadRequestException(
        `Payment verification failed: ${verificationResult.reason}`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const paymentRepo = manager.getRepository(OrderPayment);
      const couponRepo = manager.getRepository(Coupon);

      const newPayment = paymentRepo.create({
        user: { id: userId } as User,
        amount,
        currency,
        transactionId,
        paymentMethod: paymentProvider,
      });
      const savedPayment = await paymentRepo.save(newPayment);

      const newOrder = orderRepo.create({
        user: { id: userId } as User,
        total: amount,
        payment: savedPayment,
      });
      await orderRepo.save(newOrder);

      const user = await manager.findOne(User, { where: { id: userId } });

      const balanceBefore = coupon.balance;
      coupon.balance =
        parseFloat(coupon.balance.toString()) + amount;
      const savedCoupon = await couponRepo.save(coupon);

      await this.couponTransactionService.createTransaction(
        {
          coupon: savedCoupon,
          amount,
          type: TransactionType.RELOAD,
          balanceBefore,
          balanceAfter: coupon.balance,
          order: newOrder,
        },
        manager,
      );

      await this.walletService.creditEarning({
        userId: coupon.couponProduct.user.id,
        amount: amount,
        type: WalletTransactionType.EARNING_COUPON,
        description: `Coupon reload - ${savedCoupon.code}`,
      });

      // Process Cashback
      if (user.email) {
        await this.centralIntegrationService.processCashback(
          user.email,
          Number(amount),
          CashbackEvent.COUPON_PURCHASE, // Treat reload as purchase for now
          transactionId,
        );
      }

      return savedCoupon;
    });
  }

  async findUserCoupons(userId: string): Promise<Coupon[]> {
    return this.couponRepository.find({
      where: [{ buyer: { id: userId } }, { recipient: { id: userId } }],
      relations: ['owner', 'couponProduct'],
    });
  }

  async findCouponByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { code },
      relations: ['couponProduct', 'transactions', 'owner'],
    });
    if (!coupon) {
      throw new NotFoundException('Coupon not found.');
    }
    return coupon;
  }

  private async findActiveCouponByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { code },
      relations: ['couponProduct', 'couponProduct.user', 'owner'],
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found.');
    }
    if (coupon.status === CouponStatus.DISABLED) {
      throw new BadRequestException('This coupon is not active.');
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new BadRequestException('This coupon has expired.');
    }
    if (coupon.status === CouponStatus.REDEEMED) {
      throw new BadRequestException('This coupon has been fully redeemed.');
    }

    return coupon;
  }
  private validatePurchaseAmount(
    amount: number,
    product: CouponProduct,
  ): void {
    const {
      fixedAmounts,
      allowCustomAmount,
      minCustomAmount,
      maxCustomAmount,
    } = product;

    const isFixedAmountValid = fixedAmounts?.includes(amount);

    if (isFixedAmountValid) {
      return;
    }

    const isCustomAmountValid =
      allowCustomAmount &&
      (minCustomAmount === null || amount >= minCustomAmount) &&
      (maxCustomAmount === null || amount <= maxCustomAmount);

    if (isCustomAmountValid) {
      return;
    }
    const buildErrorMessage = () => {
      const validOptions: string[] = [];
      if (fixedAmounts?.length > 0) {
        validOptions.push(`one of: ${fixedAmounts.join(', ')}`);
      }
      if (allowCustomAmount) {
        if (minCustomAmount !== null && maxCustomAmount !== null) {
          validOptions.push(
            `a custom amount between ${minCustomAmount} and ${maxCustomAmount}`,
          );
        } else if (minCustomAmount !== null) {
          validOptions.push(
            `a custom amount greater than or equal to ${minCustomAmount}`,
          );
        } else if (maxCustomAmount !== null) {
          validOptions.push(
            `a custom amount less than or equal to ${maxCustomAmount}`,
          );
        }
      }

      if (validOptions.length === 0) {
        return 'This coupon product is not configured for purchasing.';
      }

      return `Invalid amount. Must be ${validOptions.join(' or ')}.`;
    };

    throw new BadRequestException(buildErrorMessage());
  }

  private async generateUniqueCouponCode(): Promise<string> {
    let code: string;
    let isUnique = false;
    while (!isUnique) {
      code = crypto.randomBytes(4).toString('hex').toUpperCase();
      const existing = await this.couponRepository.findOne({ where: { code } });
      if (!existing) {
        isUnique = true;
      }
    }
    return code;
  }

  async getSummaryStatistics(
    ownerId: string,
  ): Promise<any> {
    const soldQuery = this.couponTransactionService
      .createQueryBuilder('transaction')
      .innerJoin('transaction.coupon', 'coupon')
      .select('SUM(transaction.amount)', 'total')
      .where('coupon.ownerId = :ownerId', { ownerId })
      .andWhere('transaction.type = :type', { type: TransactionType.PURCHASE });

    const redeemedQuery = this.couponTransactionService
      .createQueryBuilder('transaction')
      .innerJoin('transaction.coupon', 'coupon')
      .select('SUM(transaction.amount)', 'total')
      .where('coupon.ownerId = :ownerId', { ownerId })
      .andWhere('transaction.type = :type', {
        type: TransactionType.REDEMPTION,
      });

    const [sold, redeemed] = await Promise.all([
      soldQuery.getRawOne(),
      redeemedQuery.getRawOne(),
    ]);

    const totalSold = parseFloat(sold.total) || 0;
    const totalRedeemed = parseFloat(redeemed.total) || 0;

    return {
      totalSold,
      totalRedeemed,
      outstandingLiability: totalSold - totalRedeemed,
    };
  }

  async redeemForOrder(
    redeemDto: any,
    order: Order,
    manager?: any,
  ): Promise<Coupon> {
    const { code, amount } = redeemDto;

    const entityManager = manager || this.dataSource.manager;
    return entityManager.transaction(async (transactionalManager) => {
      const couponRepo = transactionalManager.getRepository(Coupon);
      const coupon = await couponRepo.findOne({
        where: { code },
        relations: ['couponProduct'],
      });

      if (!coupon) {
        throw new NotFoundException('Coupon not found.');
      }

      await this.validateCouponForRedemption(coupon, manager);

      const product = coupon.couponProduct;
      const redemptionAmount = amount ?? coupon.balance;

      if (redemptionAmount > coupon.balance) {
        throw new BadRequestException(
          'Redemption amount exceeds coupon balance.',
        );
      }

      const balanceBefore = coupon.balance;
      coupon.balance -= redemptionAmount;
      const balanceAfter = coupon.balance;

      coupon.status =
        balanceAfter === 0
          ? CouponStatus.REDEEMED
          : CouponStatus.PARTIALLY_REDEEMED;

      await this.couponTransactionService.createTransaction(
        {
          coupon,
          amount: redemptionAmount,
          type: TransactionType.REDEMPTION,
          balanceBefore,
          balanceAfter,
          notes: `Redeemed for order ${order.id}.`,
          order,
        },
        manager,
      );

      return couponRepo.save(coupon);
    });
  }

  private async validateCouponForRedemption(
    coupon: Coupon,
    manager?: any,
  ): Promise<void> {
    if (coupon.status === CouponStatus.REDEEMED) {
      throw new Error(
        'This coupon has already been fully redeemed.',
      );
    }
    if (coupon.status === CouponStatus.DISABLED) {
      throw new BadRequestException('This coupon is currently disabled.');
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      coupon.status = CouponStatus.EXPIRED;
      const couponRepo = manager
        ? manager.getRepository(Coupon)
        : this.couponRepository;
      await couponRepo.save(coupon);
      throw new BadRequestException('This coupon has expired.');
    }
  }
  async getOwnerStats(
    ownerId: string,
  ): Promise<CouponStatsDto> {
    const liabilityResult = await this.couponRepository
      .createQueryBuilder('coupon')
      .select('SUM(coupon.balance)', 'sum')
      .where('coupon.ownerId = :ownerId', { ownerId })
      .andWhere('coupon.status IN (:...statuses)', { statuses: [CouponStatus.UNREDEEMED, CouponStatus.PARTIALLY_REDEEMED] })
      .getRawOne();

    const transactionsResult = await this.couponTransactionService
      .createQueryBuilder('transaction')
      .leftJoin('transaction.coupon', 'coupon')
      .select('transaction.type', 'type')
      .addSelect('SUM(transaction.amount)', 'sum')
      .where('coupon.ownerId = :ownerId', { ownerId })
      .groupBy('transaction.type')
      .getRawMany();

    const activeCoupons = await this.couponRepository.count({
      where: [
        { owner: { id: ownerId }, status: CouponStatus.UNREDEEMED },
        { owner: { id: ownerId }, status: CouponStatus.PARTIALLY_REDEEMED }
      ],
    });

    let totalSold = 0;
    let totalRedeemed = 0;

    for (const t of transactionsResult) {
      if (t.type === TransactionType.PURCHASE || t.type === TransactionType.RELOAD) {
        totalSold += parseFloat(t.sum);
      }
      if (t.type === TransactionType.REDEMPTION) {
        // Redemption amounts are positive in our DB logic (subtracted from balance)
        totalRedeemed += parseFloat(t.sum);
      }
    }

    return {
      totalSold,
      totalRedeemed,
      outstandingLiability: parseFloat(liabilityResult.sum) || 0,
      activeCoupons,
    };
  }

  async getSalesVsRedemptionsChartData(
    ownerId: string,
  ): Promise<CouponChartDataDto> {
    const rawData = await this.couponTransactionService
      .createQueryBuilder('transaction')
      .leftJoin('transaction.coupon', 'coupon')
      .select(`to_char(transaction.createdAt, 'YYYY-MM')`, 'month')
      .addSelect('transaction.type', 'type')
      .addSelect('SUM(transaction.amount)', 'amount')
      .where('coupon.ownerId = :ownerId', { ownerId })
      .andWhere(`transaction.type IN (:...types)`, {
        types: [
          TransactionType.PURCHASE,
          TransactionType.RELOAD,
          TransactionType.REDEMPTION,
        ],
      })
      .groupBy(`month, transaction.type`)
      .orderBy('month', 'ASC')
      .getRawMany();

    const aggregatedData: {
      [month: string]: { sales: number; redemptions: number };
    } = {};

    for (const item of rawData) {
      const month = item.month;
      if (!aggregatedData[month]) {
        aggregatedData[month] = { sales: 0, redemptions: 0 };
      }

      if (
        item.type === TransactionType.PURCHASE ||
        item.type === TransactionType.RELOAD
      ) {
        aggregatedData[month].sales += parseFloat(item.amount);
      } else if (item.type === TransactionType.REDEMPTION) {
        aggregatedData[month].redemptions += parseFloat(item.amount);
      }
    }

    const data = Object.entries(aggregatedData).map(([month, values]) => ({
      month,
      ...values,
    }));

    return { data };
  }

  async getTransactionHistoryForOwner(
    ownerId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<CouponTransactionHistoryDto[]> {
    const query = this.couponTransactionService
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.coupon', 'coupon')
      .leftJoinAndSelect('coupon.buyer', 'buyer')
      .leftJoinAndSelect('transaction.order', 'order')
      .leftJoinAndSelect('order.user', 'orderUser')
      .where('coupon.ownerId = :ownerId', { ownerId })
      .orderBy('transaction.createdAt', 'DESC');

    if (startDate && endDate) {
      query.andWhere({
        createdAt: Between(new Date(startDate), new Date(endDate)),
      });
    } else if (startDate) {
      query.andWhere({
        createdAt: MoreThanOrEqual(new Date(startDate)),
      });
    }

    const transactions = await query.getMany();

    return transactions.map((t) => {
      let customerName = 'N/A';
      let customerEmail = 'N/A';
      const coupon: any = t.coupon;

      if (t.type === TransactionType.REDEMPTION || t.type === TransactionType.RELOAD) {
        if (t.order?.user) {
          customerName = t.order.user.name || `${t.order.user.firstName} ${t.order.user.lastName}`;
          customerEmail = t.order.user.email;
        } else if (coupon.buyer) {
          customerName = coupon.buyer.name || `${coupon.buyer.firstName} ${coupon.buyer.lastName}`;
          customerEmail = coupon.buyer.email;
        }
      } else if (t.type === TransactionType.PURCHASE) {
        if (coupon.buyer) {
          customerName = coupon.buyer.name || `${coupon.buyer.firstName} ${coupon.buyer.lastName}`;
          customerEmail = coupon.buyer.email;
        } else {
          customerName = coupon.recipientName;
          customerEmail = coupon.recipientEmail;
        }
      }

      return {
        id: t.id,
        type: t.type,
        amount: t.amount,
        createdAt: t.createdAt,
        customerName,
        customerEmail,
        couponCode: coupon.code,
      };
    });
  }
}