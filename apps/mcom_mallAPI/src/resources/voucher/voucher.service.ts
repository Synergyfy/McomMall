import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, In } from 'typeorm';
import * as crypto from 'crypto';

import { Voucher, VoucherStatus } from './entities/voucher.entity';
import { VoucherProduct } from './entities/voucher-product.entity';
import {
  DigitalValueTransaction,
  DigitalValueTransactionType,
  DigitalValueTransactionStatus,
} from '../digital-value/entities/digital-value-transaction.entity';
import { DigitalValueStatus, DigitalValueDeliveryStatus } from '../digital-value/entities/digital-value.entity';
import { DigitalValueService } from '../digital-value/digital-value.service';

import { CreateVoucherProductDto } from './dto/create-voucher-product.dto';
import { UpdateVoucherProductDto } from './dto/update-voucher-product.dto';
import { RedeemVoucherDto } from './dto/redeem-voucher.dto';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { CashbackEvent } from '../../common/enums/cashback-event.enum';
import {
  OrderPayment,
  PaymentMethod,
} from '../order/entities/order-payment.entity';
import { Order } from '../order/entities/order.entity';
import { InitiateVoucherPurchaseDto } from './dto/initiate-voucher-purchase.dto';
import { VerifyVoucherPurchaseDto } from './dto/verify-voucher-purchase.dto';
import { InitiateReloadDto } from './dto/initiate-reload.dto';
import { VerifyReloadDto } from './dto/verify-reload.dto';
import { VoucherSummaryStatisticsDto } from './dto/voucher-summary-statistics.dto';
import { VoucherHistoryQueryDto } from './dto/voucher-history-query.dto';
import { PageDto } from '../../common/dto/page.dto';
import { VoucherTransactionHistoryDto } from './dto/voucher-transaction-history.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { WalletService } from '../wallet/wallet.service';
import { WalletTransactionType } from '../wallet/entities/wallet-transaction.entity';
import { VoucherProductSearchDto } from './dto/voucher-product-search.dto';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(VoucherProduct)
    private readonly voucherProductRepository: Repository<VoucherProduct>,
    @InjectRepository(DigitalValueTransaction)
    private readonly voucherTransactionRepository: Repository<DigitalValueTransaction>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderPayment)
    private readonly orderPaymentRepository: Repository<OrderPayment>,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly centralIntegrationService: CentralIntegrationService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
    private readonly digitalValueService: DigitalValueService,
  ) {}

  // --- Business Owner Methods ---

  async createVoucherProduct(
    userId: string,
    createDto: CreateVoucherProductDto,
  ): Promise<VoucherProduct> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }

    const newProduct = this.voucherProductRepository.create({
      ...createDto,
      user,
    });

    return this.voucherProductRepository.save(newProduct);
  }

  async updateVoucherProduct(
    id: string,
    updateDto: UpdateVoucherProductDto,
  ): Promise<VoucherProduct> {
    const product = await this.voucherProductRepository.preload({
      id,
      ...updateDto,
    });

    if (!product) {
      throw new NotFoundException(`VoucherProduct with ID "${id}" not found.`);
    }

    return this.voucherProductRepository.save(product);
  }

  async findVoucherProductsByBusiness(
    businessId: string,
  ): Promise<VoucherProduct[]> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });
    if (!business) {
      throw new NotFoundException(`Business with ID "${businessId}" not found.`);
    }
    if (!business.user) {
      throw new InternalServerErrorException(
        `Business with ID "${businessId}" has no associated owner.`,
      );
    }
    return this.voucherProductRepository.find({
      where: { user: { id: business.user.id } },
    });
  }

  async findVoucherProductsForUser(userId: string): Promise<VoucherProduct[]> {
    return this.voucherProductRepository.find({
      where: { user: { id: userId } },
    });
  }

  async findActiveVoucherProductsByBusiness(
    businessId: string,
  ): Promise<VoucherProduct[]> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });
    if (!business) {
      throw new NotFoundException(`Business with ID "${businessId}" not found.`);
    }
    if (!business.user) {
      throw new InternalServerErrorException(
        `Business with ID "${businessId}" has no associated owner.`,
      );
    }
    return this.voucherProductRepository.find({
      where: {
        user: { id: business.user.id },
        isEnabled: true,
      },
    });
  }

  async findVouchersSoldByBusiness(businessId: string): Promise<Voucher[]> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });
    if (!business) {
      throw new NotFoundException(`Business with ID "${businessId}" not found.`);
    }
    if (!business.user) {
      throw new InternalServerErrorException(
        `Business with ID "${businessId}" has no associated owner.`,
      );
    }
    return this.voucherRepository.find({
      where: { owner: { id: business.user.id } },
      relations: ['purchaser', 'owner', 'order'], // buyer renamed to purchaser in DigitalValue
    });
  }

  // --- Consumer Methods ---

  async initiateVoucherPurchase(
    initiateDto: InitiateVoucherPurchaseDto,
  ): Promise<{ clientSecret?: string; orderId?: string; provider: PaymentMethod }> {
    const product = await this.voucherProductRepository.findOneBy({
      id: initiateDto.voucherProductId,
      isEnabled: true,
    });
    if (!product) {
      throw new NotFoundException('Voucher product not found or is inactive.');
    }

    this.validatePurchaseAmount(initiateDto.amount, product);

    const currency = 'GBP';

    if (initiateDto.paymentProvider === PaymentMethod.STRIPE) {
      const paymentIntent = await this.paymentProviderService.createStripePaymentIntent(
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

  async verifyAndCompletePurchase(
    verifyDto: VerifyVoucherPurchaseDto,
    userId: string,
  ): Promise<Voucher> {
    const { purchaseDetails, paymentProvider, transactionId } = verifyDto;
    const { voucherProductId, amount } = purchaseDetails;

    const product = await this.voucherProductRepository.findOne({
      where: { id: voucherProductId, isEnabled: true },
      relations: ['user'],
    });

    if (!product) {
      throw new NotFoundException('Voucher product not found or is inactive.');
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
      const voucherRepo = manager.getRepository(Voucher);
      const transactionRepo = manager.getRepository(DigitalValueTransaction);

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

      const code = await this.generateUniqueVoucherCode();
      const expiryDate = product.expiryDays
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

      const newVoucher = voucherRepo.create({
        code,
        initialBalance: finalAmount,
        currentBalance: finalAmount,
        status: isScheduled
          ? DigitalValueStatus.DRAFT // or DISABLED/FUNDED
          : DigitalValueStatus.ACTIVE,
        expiryDate,
        purchaserId: userId,
        owner: product.user, // The business owner owns the voucher?
        // In Voucher logic, owner was product.user.
        // In GiftCard logic, owner was business user.
        // In DigitalValue logic, owner is user who holds it?
        // PRD: "Allow consumers to buy digital value instruments... Create for themselves".
        // If I buy it, I am the owner.
        // But `GiftCardService` set ownerId to `business.user.id`. Wait.
        // Re-reading `GiftCardService`... `ownerId: business.user.id`?
        // Ah, `GiftCardTemplate` has `owner` (Business).
        // `GiftCard` has `owner` (Consumer?).
        // In `purchaseGiftCard`: `ownerId` was `business.user.id`.
        // This implies the Gift Card belongs to the Business until given? Or is it a liability of the business?
        // `purchaserId` was `userId`.
        // In `createSystemGiftCard`, `ownerId` was recipient.

        // Let's stick to existing logic for `Voucher`.
        // `Voucher` entity: `owner: User` (nullable).
        // `VoucherProduct` has `user` (Business).
        // `VoucherService` sets `owner: product.user`.
        // This means the Business "owns" the voucher record?
        // But `buyer` was `userId`.
        // If `owner` is Business, `findUserVouchers` queries `buyer` or `recipient`.
        // Okay.
        voucherProduct: product,
        order: savedOrder,
        deliveryDate,
        deliveryStatus: isScheduled ? DigitalValueDeliveryStatus.PENDING : DigitalValueDeliveryStatus.DELIVERED,
        recipientName: purchaseDetails.recipientName,
        recipientEmail: purchaseDetails.recipientEmail,
        personalMessage: purchaseDetails.personalMessage,
      });

      const savedVoucher = await voucherRepo.save(newVoucher);

      await transactionRepo.save(
        transactionRepo.create({
            digitalValue: savedVoucher,
            amount: savedVoucher.initialBalance,
            type: DigitalValueTransactionType.FUND,
            status: DigitalValueTransactionStatus.COMPLETED,
            metadata: { orderId: savedOrder.id, notes: 'Initial voucher purchase.' },
        })
      );

      await this.walletService.creditEarning({
        userId: product.user.id,
        amount,
        type: WalletTransactionType.EARNING_VOUCHER,
        description: `Voucher purchase - ${savedVoucher.code}`,
      });

      // Process Cashback
      if (user.email) {
        await this.centralIntegrationService.processCashback(
          user.email,
          Number(amount),
          CashbackEvent.VOUCHER_PURCHASE,
          transactionId,
        );
      }

      return {
        ...savedVoucher,
        // transactionId: savedOrder.id,
      };
    });
  }

  async initiateVoucherReload(
    code: string,
    initiateDto: InitiateReloadDto,
  ): Promise<{ clientSecret?: string; orderId?: string; provider: PaymentMethod }> {
    const voucher = await this.findActiveVoucherByCode(code);
    const product = await this.voucherProductRepository.findOneBy({
      id: voucher.voucherProduct.id,
    });

    if (!product.allowReloading) {
      throw new BadRequestException('This voucher cannot be reloaded.');
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
    verifyDto: VerifyReloadDto,
    userId: string,
  ): Promise<Voucher> {
    const { reloadDetails, paymentProvider, transactionId } = verifyDto;
    const { amount } = reloadDetails;

    const voucher = await this.findActiveVoucherByCode(code);
    const product = await this.voucherProductRepository.findOneBy({
      id: voucher.voucherProduct.id,
    });

    if (!product.allowReloading) {
      throw new BadRequestException('This voucher cannot be reloaded.');
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
      const voucherRepo = manager.getRepository(Voucher);
      const transactionRepo = manager.getRepository(DigitalValueTransaction);

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

      voucher.currentBalance =
        parseFloat(voucher.currentBalance.toString()) + amount;
      const savedVoucher = await voucherRepo.save(voucher);

      await transactionRepo.save(
          transactionRepo.create({
              digitalValue: savedVoucher,
              amount,
              type: DigitalValueTransactionType.TOPUP, // RELOAD -> TOPUP
              status: DigitalValueTransactionStatus.COMPLETED,
              metadata: { orderId: newOrder.id, notes: 'Reload' },
          })
      );

      await this.walletService.creditEarning({
        userId: voucher.voucherProduct.user.id,
        amount: amount,
        type: WalletTransactionType.EARNING_VOUCHER,
        description: `Voucher reload - ${savedVoucher.code}`,
      });

      // Process Cashback
      if (user.email) {
        await this.centralIntegrationService.processCashback(
          user.email,
          Number(amount),
          CashbackEvent.VOUCHER_PURCHASE,
          transactionId,
        );
      }

      return savedVoucher;
    });
  }

  async redeemVoucher(
    redeemDto: RedeemVoucherDto,
    staffId?: string,
  ): Promise<Voucher> {
    const { code, amount } = redeemDto;

    return this.dataSource.transaction(async (manager) => {
      const voucherRepo = manager.getRepository(Voucher);
      const voucher = await voucherRepo.findOne({
        where: { code },
        relations: ['voucherProduct'],
      });

      if (!voucher) {
        throw new NotFoundException('Voucher not found.');
      }

      await this.validateVoucherForRedemption(voucher, manager);

      const product = voucher.voucherProduct;
      const redemptionAmount = amount ?? voucher.currentBalance;

      if (redemptionAmount > voucher.currentBalance) {
        throw new BadRequestException(
          'Redemption amount exceeds voucher balance.',
        );
      }

      if (amount && !product.allowPartialRedemption) {
        throw new BadRequestException(
          'This voucher does not allow partial redemption.',
        );
      }

      voucher.currentBalance -= redemptionAmount;

      voucher.status =
        voucher.currentBalance === 0
          ? DigitalValueStatus.FULLY_REDEEMED
          : DigitalValueStatus.PARTIALLY_REDEEMED;

      const transactionRepo = manager.getRepository(DigitalValueTransaction);
      await transactionRepo.save(
          transactionRepo.create({
              digitalValue: voucher,
              amount: redemptionAmount,
              type: DigitalValueTransactionType.REDEEM,
              status: DigitalValueTransactionStatus.COMPLETED,
              metadata: { processedById: staffId, notes: 'Voucher redeemed.' },
          })
      );

      return voucherRepo.save(voucher);
    });
  }

  async redeemForOrder(
    redeemDto: RedeemVoucherDto,
    order: Order,
    manager?: EntityManager,
  ): Promise<Voucher> {
    const { code, amount } = redeemDto;

    const entityManager = manager || this.dataSource.manager;
    return entityManager.transaction(async (transactionalManager) => {
      const voucherRepo = transactionalManager.getRepository(Voucher);
      const voucher = await voucherRepo.findOne({
        where: { code },
        relations: ['voucherProduct'],
      });

      if (!voucher) {
        throw new NotFoundException('Voucher not found.');
      }

      await this.validateVoucherForRedemption(voucher, manager);

      const product = voucher.voucherProduct;
      const redemptionAmount = amount ?? voucher.currentBalance;

      if (redemptionAmount > voucher.currentBalance) {
        throw new BadRequestException(
          'Redemption amount exceeds voucher balance.',
        );
      }

      if (amount && !product.allowPartialRedemption) {
        throw new BadRequestException(
          'This voucher does not allow partial redemption.',
        );
      }

      voucher.currentBalance -= redemptionAmount;

      voucher.status =
        voucher.currentBalance === 0
          ? DigitalValueStatus.FULLY_REDEEMED
          : DigitalValueStatus.PARTIALLY_REDEEMED;

      const transactionRepo = transactionalManager.getRepository(DigitalValueTransaction);
      await transactionRepo.save(
          transactionRepo.create({
              digitalValue: voucher,
              amount: redemptionAmount,
              type: DigitalValueTransactionType.REDEEM,
              status: DigitalValueTransactionStatus.COMPLETED,
              metadata: { orderId: order.id, notes: `Redeemed for order ${order.id}.` },
          })
      );

      return voucherRepo.save(voucher);
    });
  }

  async findUserVouchers(userId: string): Promise<Voucher[]> {
    return this.voucherRepository.find({
      // buyer -> purchaserId. recipient (User) -> not in DigitalValue explicit relation but we can check...
      // Wait, DigitalValue has `owner` and `purchaser`.
      // `Voucher` logic was: buyer or recipient.
      // If `DigitalValue.owner` represents the current holder, we should query `ownerId`.
      // `purchaser` is who bought it.
      where: [{ purchaser: { id: userId } }, { owner: { id: userId } }],
      relations: ['owner', 'voucherProduct'],
    });
  }

  // --- Admin & Utility Methods ---

  async findVoucherByCode(code: string): Promise<Voucher> {
    const voucher = await this.voucherRepository.findOne({
      where: { code },
      relations: ['voucherProduct', 'transactions', 'owner'],
    });
    if (!voucher) {
      throw new NotFoundException('Voucher not found.');
    }
    return voucher;
  }

  async manuallyMarkAsRedeemed(
    code: string,
    staffId: string,
  ): Promise<Voucher> {
    return this.dataSource.transaction(async (manager) => {
      const voucherRepo = manager.getRepository(Voucher);
      const voucher = await voucherRepo.findOne({ where: { code } });

      if (!voucher) {
        throw new NotFoundException('Voucher not found.');
      }

      await this.validateVoucherForRedemption(voucher, manager);

      const redemptionAmount = voucher.currentBalance;
      voucher.currentBalance = 0;

      const transactionRepo = manager.getRepository(DigitalValueTransaction);
      await transactionRepo.save(
          transactionRepo.create({
              digitalValue: voucher,
              amount: redemptionAmount,
              type: DigitalValueTransactionType.REDEEM,
              status: DigitalValueTransactionStatus.COMPLETED,
              metadata: { processedById: staffId, notes: 'Manually marked as redeemed by staff.' },
          })
      );

      voucher.status = DigitalValueStatus.FULLY_REDEEMED;
      return voucherRepo.save(voucher);
    });
  }

  // --- Statistics and History ---

  async getSummaryStatistics(
    ownerId: string,
  ): Promise<VoucherSummaryStatisticsDto> {
    const soldQuery = this.voucherTransactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.digitalValue', 'voucher')
      .select('SUM(transaction.amount)', 'total')
      .where('voucher.ownerId = :ownerId', { ownerId })
      .andWhere('transaction.type = :type', { type: DigitalValueTransactionType.FUND });

    const redeemedQuery = this.voucherTransactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.digitalValue', 'voucher')
      .select('SUM(transaction.amount)', 'total')
      .where('voucher.ownerId = :ownerId', { ownerId })
      .andWhere('transaction.type = :type', {
        type: DigitalValueTransactionType.REDEEM,
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

  async getTransactionHistory(
    ownerId: string,
    query: VoucherHistoryQueryDto,
  ): Promise<PageDto<VoucherTransactionHistoryDto>> {
    const qb = this.voucherTransactionRepository
      .createQueryBuilder('transaction')
      .innerJoinAndSelect('transaction.digitalValue', 'voucher')
      .innerJoinAndSelect('voucher.purchaser', 'buyer')
      .where('voucher.ownerId = :ownerId', { ownerId })
      .orderBy('transaction.createdAt', query.order)
      .skip(query.skip)
      .take(query.take);

    if (query.startDate) {
      qb.andWhere('transaction.createdAt >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      qb.andWhere('transaction.createdAt <= :endDate', {
        endDate: query.endDate,
      });
    }

    const [transactions, total] = await qb.getManyAndCount();

    const history = transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type as any, // Cast
      createdAt: t.createdAt,
      customer: {
        id: (t.digitalValue.purchaser || (t.digitalValue as Voucher).owner)?.id, // owner/purchaser
        name: (t.digitalValue.purchaser || (t.digitalValue as Voucher).owner)?.name,
        email: (t.digitalValue.purchaser || (t.digitalValue as Voucher).owner)?.email,
      },
    }));

    const pageMeta = new PageMetaDto({
      pageOptionsDto: query,
      itemCount: transactions.length,
      totalItems: total,
    });

    return new PageDto(history, pageMeta);
  }

  private async findActiveVoucherByCode(code: string): Promise<Voucher> {
    const voucher = await this.voucherRepository.findOne({
      where: { code },
      relations: ['voucherProduct', 'voucherProduct.user', 'owner'],
    });

    if (!voucher) {
      throw new NotFoundException('Voucher not found.');
    }
    // Updated statuses
    const activeStatuses = [DigitalValueStatus.ACTIVE, DigitalValueStatus.PARTIALLY_REDEEMED, DigitalValueStatus.FUNDED];
    if (!activeStatuses.includes(voucher.status)) {
      throw new BadRequestException('This voucher is not active.');
    }
    if (voucher.expiryDate && new Date() > voucher.expiryDate) {
      throw new BadRequestException('This voucher has expired.');
    }

    return voucher;
  }
  // --- System Integration Methods ---

  async createSystemVoucher(payload: {
    amount: number;
    recipientEmail: string;
    recipientName?: string;
    message?: string;
    businessName: string;
  }): Promise<Voucher> {
    const amount = Number(payload.amount);
    const { recipientEmail, recipientName, message, businessName } = payload;

    const code = await this.generateUniqueVoucherCode();
    // Default expiry 1 year for loyalty rewards
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Try to find existing user to link
    const owner = await this.userRepository.findOne({ where: { email: recipientEmail } });

    const newVoucher = this.voucherRepository.create({
      code,
      initialBalance: amount,
      currentBalance: amount,
      status: DigitalValueStatus.ACTIVE, // UNREDEEMED -> ACTIVE
      expiryDate,
      owner: owner || null,
      purchaser: owner || null,
      recipientEmail,
      recipientName,
      personalMessage: message || `Reward from ${businessName}`,
    });

    const savedVoucher = await this.voucherRepository.save(newVoucher);

    // Create a transaction record
    const transactionRepo = this.dataSource.getRepository(DigitalValueTransaction);
    await transactionRepo.save(
        transactionRepo.create({
            digitalValue: savedVoucher,
            amount,
            type: DigitalValueTransactionType.FUND,
            status: DigitalValueTransactionStatus.COMPLETED,
            metadata: { notes: `Generated by Loyalty System for ${businessName}` },
        })
    );

    return savedVoucher;
  }

  // --- Private Helper Methods ---

  private validatePurchaseAmount(
    amount: number,
    product: VoucherProduct,
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

    // If we reach here, the amount is invalid. Construct a helpful error message.
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
        return 'This voucher product is not configured for purchasing.';
      }

      return `Invalid amount. Must be ${validOptions.join(' or ')}.`;
    };

    throw new BadRequestException(buildErrorMessage());
  }

  private async generateUniqueVoucherCode(): Promise<string> {
    let code: string;
    let isUnique = false;
    while (!isUnique) {
      code = crypto.randomBytes(4).toString('hex').toUpperCase();
      const existing = await this.voucherRepository.findOne({ where: { code } });
      if (!existing) {
        isUnique = true;
      }
    }
    return code;
  }

  private async validateVoucherForRedemption(
    voucher: Voucher,
    manager?: EntityManager,
  ): Promise<void> {
    if (voucher.status === DigitalValueStatus.FULLY_REDEEMED) {
      throw new ConflictException(
        'This voucher has already been fully redeemed.',
      );
    }
    if (voucher.status === DigitalValueStatus.DISABLED) {
      throw new BadRequestException('This voucher is currently disabled.');
    }
    if (voucher.expiryDate && new Date() > voucher.expiryDate) {
      voucher.status = DigitalValueStatus.EXPIRED;
      const voucherRepo = manager
        ? manager.getRepository(Voucher)
        : this.voucherRepository;
      await voucherRepo.save(voucher);
      throw new BadRequestException('This voucher has expired.');
    }
  }

  async findAllPublicVoucherProducts(searchDto: VoucherProductSearchDto): Promise<PageDto<VoucherProduct>> {
    const { page, limit, search, minAmount, maxAmount, businessId, businessName } = searchDto;

    const queryBuilder = this.voucherProductRepository.createQueryBuilder('voucherProduct');

    queryBuilder
      .leftJoinAndSelect('voucherProduct.user', 'user')
      .leftJoin('user.businesses', 'business')
      .where('voucherProduct.isEnabled = :isEnabled', { isEnabled: true });

    if (search) {
      queryBuilder.andWhere(
        '(voucherProduct.name ILIKE :search OR voucherProduct.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (minAmount !== undefined) {
      queryBuilder.andWhere('voucherProduct.minCustomAmount >= :minAmount', { minAmount });
    }

    if (maxAmount !== undefined) {
      queryBuilder.andWhere('voucherProduct.maxCustomAmount <= :maxAmount', { maxAmount });
    }

    if (businessId) {
      queryBuilder.andWhere('business.id = :businessId', { businessId });
    }

    if (businessName) {
      queryBuilder.andWhere('business.businessName ILIKE :businessName', {
        businessName: `%${businessName}%`,
      });
    }

    queryBuilder
      .orderBy('voucherProduct.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      totalItems,
      itemCount: items.length,
      pageOptionsDto: searchDto,
    });

    return new PageDto(items, pageMetaDto);
  }
}
