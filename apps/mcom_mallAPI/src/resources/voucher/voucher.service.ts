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
import { Repository, DataSource, EntityManager } from 'typeorm';
import * as crypto from 'crypto';

import { Voucher, VoucherStatus } from './entities/voucher.entity';
import { VoucherProduct } from './entities/voucher-product.entity';
import {
  VoucherTransaction,
  TransactionType,
} from './entities/voucher-transaction.entity';

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
import { PageDto } from 'src/common/dto/page.dto';
import { VoucherTransactionHistoryDto } from './dto/voucher-transaction-history.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { WalletService } from '../wallet/wallet.service';
import { WalletTransactionType } from '../wallet/entities/wallet-transaction.entity';
import { VoucherProductSearchDto } from './dto/voucher-product-search.dto';
import { DigitalValueService } from '../digital-value/digital-value.service';
import { DigitalValueType } from '../digital-value/digital-value.enums';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(VoucherProduct)
    private readonly voucherProductRepository: Repository<VoucherProduct>,
    @InjectRepository(VoucherTransaction)
    private readonly voucherTransactionRepository: Repository<VoucherTransaction>,
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
      throw new NotFoundException(
        `Business with ID "${businessId}" not found.`,
      );
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
      throw new NotFoundException(
        `Business with ID "${businessId}" not found.`,
      );
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
      throw new NotFoundException(
        `Business with ID "${businessId}" not found.`,
      );
    }
    if (!business.user) {
      throw new InternalServerErrorException(
        `Business with ID "${businessId}" has no associated owner.`,
      );
    }
    return this.voucherRepository.find({
      where: { owner: { id: business.user.id } },
      relations: ['buyer', 'recipient', 'order'],
    });
  }

  // --- Consumer Methods ---

  async initiateVoucherPurchase(
    initiateDto: InitiateVoucherPurchaseDto,
  ): Promise<{
    clientSecret?: string;
    orderId?: string;
    provider: PaymentMethod;
  }> {
    const product = await this.voucherProductRepository.findOneBy({
      id: initiateDto.voucherProductId,
      isEnabled: true,
    });
    if (!product) {
      throw new NotFoundException('Voucher product not found or is inactive.');
    }

    this.validatePurchaseAmount(initiateDto.amount, product);

    const currency = 'GBP'; // Or get from config/product

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

    const currency = 'GBP'; // Or get from config/product
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
      const transactionRepo = manager.getRepository(VoucherTransaction);

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

      const dv = await this.digitalValueService.create(
        {
          type: DigitalValueType.VOUCHER,
          initialValue: finalAmount,
          ownerId: userId,
          metadata: {
            ...purchaseDetails,
            voucherProductId: product.id,
          },
          expiryDate: expiresAt ? expiresAt.toISOString() : null,
        },
        userId,
        manager,
      );

      const newVoucher = voucherRepo.create({
        code: dv.code,
        initialValue: finalAmount,
        balance: finalAmount,
        status: isScheduled ? VoucherStatus.DISABLED : VoucherStatus.UNREDEEMED,
        expiresAt,
        buyer: { id: userId } as User,
        owner: product.user,
        voucherProduct: product,
        order: savedOrder,
        deliveryDate,
        recipientName: purchaseDetails.recipientName,
        recipientEmail: purchaseDetails.recipientEmail,
        personalMessage: purchaseDetails.personalMessage,
      });

      const savedVoucher = await voucherRepo.save(newVoucher);

      await this.createTransaction(
        {
          voucher: savedVoucher,
          amount,
          type: TransactionType.PURCHASE,
          balanceBefore: 0,
          balanceAfter: amount,
          notes: 'Initial voucher purchase.',
        },
        manager,
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
        transactionId: savedOrder.id,
      };
    });
  }

  async initiateVoucherReload(
    code: string,
    initiateDto: InitiateReloadDto,
  ): Promise<{
    clientSecret?: string;
    orderId?: string;
    provider: PaymentMethod;
  }> {
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

      try {
        const dv = await this.digitalValueService.getByCode(code);
        await this.digitalValueService.fund(dv.id, { amount }, manager);
      } catch (e) {
        if (e instanceof NotFoundException) {
          /* ignore legacy */
        } else {
          throw e;
        }
      }

      const user = await manager.findOne(User, { where: { id: userId } });

      const balanceBefore = voucher.balance;
      voucher.balance = parseFloat(voucher.balance.toString()) + amount;
      const savedVoucher = await voucherRepo.save(voucher);

      await this.createTransaction(
        {
          voucher: savedVoucher,
          amount,
          type: TransactionType.RELOAD,
          balanceBefore,
          balanceAfter: voucher.balance,
          order: newOrder,
        },
        manager,
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
          CashbackEvent.VOUCHER_PURCHASE, // Treat as voucher purchase event for cashback
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
      const redemptionAmount = amount ?? voucher.balance;

      if (redemptionAmount > voucher.balance) {
        throw new BadRequestException(
          'Redemption amount exceeds voucher balance.',
        );
      }

      if (amount && !product.allowPartialRedemption) {
        throw new BadRequestException(
          'This voucher does not allow partial redemption.',
        );
      }

      try {
        const dv = await this.digitalValueService.getByCode(code);
        await this.digitalValueService.redeem(
          dv.id,
          {
            amount: redemptionAmount,
            merchantId: undefined,
          },
          manager,
        );
      } catch (e) {
        if (e instanceof NotFoundException) {
          /* ignore legacy */
        } else {
          throw e;
        }
      }

      const balanceBefore = voucher.balance;
      voucher.balance -= redemptionAmount;
      const balanceAfter = voucher.balance;

      voucher.status =
        balanceAfter === 0
          ? VoucherStatus.REDEEMED
          : VoucherStatus.PARTIALLY_REDEEMED;

      await this.createTransaction(
        {
          voucher,
          amount: redemptionAmount,
          type: TransactionType.REDEMPTION,
          balanceBefore,
          balanceAfter,
          processedById: staffId,
          notes: 'Voucher redeemed.',
        },
        manager,
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
      const redemptionAmount = amount ?? voucher.balance;

      if (redemptionAmount > voucher.balance) {
        throw new BadRequestException(
          'Redemption amount exceeds voucher balance.',
        );
      }

      if (amount && !product.allowPartialRedemption) {
        throw new BadRequestException(
          'This voucher does not allow partial redemption.',
        );
      }

      try {
        const dv = await this.digitalValueService.getByCode(code);
        await this.digitalValueService.redeem(
          dv.id,
          {
            amount: redemptionAmount,
            merchantId: order.business ? order.business.id : undefined,
          },
          manager,
        );
      } catch (e) {
        if (e instanceof NotFoundException) {
          /* ignore legacy */
        } else {
          throw e;
        }
      }

      const balanceBefore = voucher.balance;
      voucher.balance -= redemptionAmount;
      const balanceAfter = voucher.balance;

      voucher.status =
        balanceAfter === 0
          ? VoucherStatus.REDEEMED
          : VoucherStatus.PARTIALLY_REDEEMED;

      await this.createTransaction(
        {
          voucher,
          amount: redemptionAmount,
          type: TransactionType.REDEMPTION,
          balanceBefore,
          balanceAfter,
          notes: `Redeemed for order ${order.id}.`,
          order,
        },
        manager,
      );

      return voucherRepo.save(voucher);
    });
  }

  async findUserVouchers(userId: string): Promise<Voucher[]> {
    return this.voucherRepository.find({
      where: [{ buyer: { id: userId } }, { recipient: { id: userId } }],
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

      const balanceBefore = voucher.balance;
      const redemptionAmount = voucher.balance;

      try {
        const dv = await this.digitalValueService.getByCode(code);
        await this.digitalValueService.redeem(
          dv.id,
          {
            amount: redemptionAmount,
            merchantId: undefined,
          },
          manager,
        );
      } catch (e) {
        if (e instanceof NotFoundException) {
          /* ignore legacy */
        } else {
          throw e;
        }
      }

      voucher.balance = 0;
      const balanceAfter = voucher.balance;

      await this.createTransaction(
        {
          voucher,
          amount: redemptionAmount,
          type: TransactionType.REDEMPTION,
          balanceBefore,
          balanceAfter,
          processedById: staffId,
          notes: 'Manually marked as redeemed by staff.',
        },
        manager,
      );

      voucher.status = VoucherStatus.REDEEMED;
      return voucherRepo.save(voucher);
    });
  }

  // --- Statistics and History ---

  async getSummaryStatistics(
    ownerId: string,
  ): Promise<VoucherSummaryStatisticsDto> {
    const soldQuery = this.voucherTransactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.voucher', 'voucher')
      .select('SUM(transaction.amount)', 'total')
      .where('voucher.ownerId = :ownerId', { ownerId })
      .andWhere('transaction.type = :type', { type: TransactionType.PURCHASE });

    const redeemedQuery = this.voucherTransactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.voucher', 'voucher')
      .select('SUM(transaction.amount)', 'total')
      .where('voucher.ownerId = :ownerId', { ownerId })
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

  async getTransactionHistory(
    ownerId: string,
    query: VoucherHistoryQueryDto,
  ): Promise<PageDto<VoucherTransactionHistoryDto>> {
    const qb = this.voucherTransactionRepository
      .createQueryBuilder('transaction')
      .innerJoinAndSelect('transaction.voucher', 'voucher')
      .innerJoinAndSelect('voucher.buyer', 'buyer')
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
      type: t.type,
      createdAt: t.createdAt,
      customer: {
        id: t.voucher.buyer.id,
        name: t.voucher.buyer.name,
        email: t.voucher.buyer.email,
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
    if (voucher.status === VoucherStatus.DISABLED) {
      throw new BadRequestException('This voucher is not active.');
    }
    if (voucher.expiresAt && new Date() > voucher.expiresAt) {
      throw new BadRequestException('This voucher has expired.');
    }
    if (voucher.status === VoucherStatus.REDEEMED) {
      throw new BadRequestException('This voucher has been fully redeemed.');
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

    // Default expiry 1 year for loyalty rewards
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Try to find existing user to link
    const owner = await this.userRepository.findOne({
      where: { email: recipientEmail },
    });

    // Use Digital Value Engine
    const dv = await this.digitalValueService.create({
      type: DigitalValueType.VOUCHER,
      initialValue: amount,
      ownerId: owner?.id,
      metadata: {
        recipientEmail,
        recipientName,
        personalMessage: message,
        businessName,
      },
      expiryDate: expiresAt.toISOString(),
    });

    const newVoucher = this.voucherRepository.create({
      code: dv.code,
      initialValue: amount,
      balance: amount,
      status: VoucherStatus.UNREDEEMED,
      expiresAt,
      // If user exists, link them as owner/buyer (so they see it in their list)
      // If not, it remains floating (only email linked) until they sign up or claim it
      owner: owner || null,
      buyer: owner || null, // Conceptually "bought" by system for them
      recipientEmail,
      recipientName,
      personalMessage: message || `Reward from ${businessName}`,
    });

    const savedVoucher = await this.voucherRepository.save(newVoucher);

    // Create a transaction record
    await this.createTransaction({
      voucher: savedVoucher,
      amount,
      type: TransactionType.PURCHASE,
      balanceBefore: 0,
      balanceAfter: amount,
      notes: `Generated by Loyalty System for ${businessName}`,
    });

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
      const existing = await this.voucherRepository.findOne({
        where: { code },
      });
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
    if (voucher.status === VoucherStatus.REDEEMED) {
      throw new ConflictException(
        'This voucher has already been fully redeemed.',
      );
    }
    if (voucher.status === VoucherStatus.DISABLED) {
      throw new BadRequestException('This voucher is currently disabled.');
    }
    if (voucher.expiresAt && new Date() > voucher.expiresAt) {
      voucher.status = VoucherStatus.EXPIRED;
      const voucherRepo = manager
        ? manager.getRepository(Voucher)
        : this.voucherRepository;
      await voucherRepo.save(voucher);
      throw new BadRequestException('This voucher has expired.');
    }
  }

  private async createTransaction(
    options: {
      voucher: Voucher;
      amount: number;
      type: TransactionType;
      balanceBefore: number;
      balanceAfter: number;
      processedById?: string;
      notes?: string;
      order?: Order;
    },
    manager?: EntityManager,
  ): Promise<VoucherTransaction> {
    const finalManager = manager || this.dataSource.manager;
    const transactionRepo = finalManager.getRepository(VoucherTransaction);
    const userRepo = finalManager.getRepository(User);

    let processedBy: User | undefined;
    if (options.processedById) {
      processedBy = await userRepo.findOne({
        where: { id: options.processedById },
      });
    }

    const transaction = transactionRepo.create({
      ...options,
      processedBy,
    });

    return transactionRepo.save(transaction);
  }

  async findAllPublicVoucherProducts(
    searchDto: VoucherProductSearchDto,
  ): Promise<PageDto<VoucherProduct>> {
    const {
      page,
      limit,
      search,
      minAmount,
      maxAmount,
      businessId,
      businessName,
    } = searchDto;

    const queryBuilder =
      this.voucherProductRepository.createQueryBuilder('voucherProduct');

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
      queryBuilder.andWhere('voucherProduct.minCustomAmount >= :minAmount', {
        minAmount,
      });
    }

    if (maxAmount !== undefined) {
      queryBuilder.andWhere('voucherProduct.maxCustomAmount <= :maxAmount', {
        maxAmount,
      });
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
