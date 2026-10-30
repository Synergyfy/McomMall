import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  UnprocessableEntityException,
  Inject,
  Optional,
  forwardRef,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
import { UserRole } from '../../common/role.enum';
import { InstrumentScopeService } from '../partner-instruments/instrument-scope.service';
import {
  InstrumentType,
  PARTNER_INSTRUMENT_CONSUMED_EVENT,
} from '../partner-instruments/enums';
import { InstrumentScopeDto } from '../partner-instruments/dto/instrument-scope.dto';
import { PartnerRequestContext } from '../partner-instruments/instrument-scope.service';
import { markReplayed } from '../partner-instruments/replay';

@Injectable()
export class VoucherService {
  private readonly logger = new Logger(VoucherService.name);

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
    @Optional()
    private readonly eventEmitter?: EventEmitter2,
    @Optional()
    private readonly instrumentScopeService?: InstrumentScopeService,
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
    userId: string,
  ): Promise<VoucherProduct> {
    const product = await this.voucherProductRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!product) {
      throw new NotFoundException(`VoucherProduct with ID "${id}" not found.`);
    }

    if (product.user?.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this voucher product.',
      );
    }

    Object.assign(product, updateDto);

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

  async findVoucherProductById(
    productId: string,
    userId?: string,
  ): Promise<VoucherProduct> {
    const product = await this.voucherProductRepository.findOne({
      where: { id: productId },
      relations: ['user'],
    });
    if (!product) {
      throw new NotFoundException(
        `Voucher product with ID ${productId} not found`,
      );
    }
    if (userId && product.user?.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this voucher product.',
      );
    }
    return product;
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
    const product = await this.voucherProductRepository.findOne({
      where: {
        id: initiateDto.voucherProductId,
        isEnabled: true,
      },
      relations: ['user'],
    });
    if (!product) {
      throw new NotFoundException('Voucher product not found or is inactive.');
    }

    if (!product.user || !product.user.isActive) {
      throw new BadRequestException(
        'The owner of this voucher product is not currently active and cannot accept purchases.',
      );
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

    if (!product.user || !product.user.isActive) {
      throw new BadRequestException(
        'The owner of this voucher product is no longer active. Payment cannot be verified.',
      );
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

    try {
      return await this.dataSource.transaction(async (manager) => {
        const orderRepo = manager.getRepository(Order);
        const paymentRepo = manager.getRepository(OrderPayment);
        const voucherRepo = manager.getRepository(Voucher);
        const _transactionRepo = manager.getRepository(VoucherTransaction);

        // Idempotency check: if transactionId already processed, return existing voucher
        const existingPayment = await paymentRepo.findOne({
          where: { transactionId },
        });
        if (existingPayment) {
          const existingVoucher = await voucherRepo.findOne({
            where: { buyer: { id: userId } },
            order: { createdAt: 'DESC' },
          });
          if (existingVoucher) return existingVoucher;
        }

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
          status: isScheduled
            ? VoucherStatus.DISABLED
            : VoucherStatus.UNREDEEMED,
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

        await this.walletService.creditEarning(
          {
            userId: product.user.id,
            amount,
            type: WalletTransactionType.EARNING_VOUCHER,
            description: `Voucher purchase - ${savedVoucher.code}`,
          },
          manager,
        );

        // Process Cashback
        if (user.email) {
          try {
            await this.centralIntegrationService.processCashback(
              user.email,
              Number(amount),
              CashbackEvent.VOUCHER_PURCHASE,
              transactionId,
            );
          } catch (error) {
            this.logger.error(
              `Failed to process cashback for voucher ${transactionId}: ${error.message}`,
            );
          }
        }

        return {
          ...savedVoucher,
          transactionId: savedOrder.id,
        };
      });
    } catch (dbErr) {
      this.logger.error(
        `Database transaction failed for voucher purchase after payment was captured. Initiating compensating refund.`,
        dbErr,
      );
      try {
        if (paymentProvider === PaymentMethod.STRIPE) {
          await this.paymentProviderService.refundStripePayment(
            transactionId,
            amount,
          );
        } else if (paymentProvider === PaymentMethod.PAYPAL) {
          await this.paymentProviderService.refundPaypalOrder(
            transactionId,
            amount,
            currency,
          );
        }
      } catch (refundErr) {
        this.logger.error(
          `Compensating refund also failed for voucher transaction ${transactionId}: ${refundErr.message}`,
        );
      }
      throw new InternalServerErrorException(
        'An error occurred while creating your voucher. If your account was charged, a refund has been initiated.',
      );
    }
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
    const product = await this.voucherProductRepository.findOne({
      where: { id: voucher.voucherProduct.id },
      relations: ['user'],
    });

    if (!product.user || !product.user.isActive) {
      throw new BadRequestException(
        'The owner of this voucher is not currently active and cannot accept reloads.',
      );
    }

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
    const product = await this.voucherProductRepository.findOne({
      where: { id: voucher.voucherProduct.id },
      relations: ['user'],
    });

    if (!product.user || !product.user.isActive) {
      throw new BadRequestException(
        'The owner of this voucher is no longer active. Reload payment cannot be verified.',
      );
    }

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

      // Idempotency check: if transactionId already processed, return existing voucher
      const existingPayment = await paymentRepo.findOne({
        where: { transactionId },
      });
      if (existingPayment) {
        return this.findVoucherByCode(code);
      }

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
        try {
          await this.centralIntegrationService.processCashback(
            user.email,
            Number(amount),
            CashbackEvent.VOUCHER_PURCHASE, // Treat as voucher purchase event for cashback
            transactionId,
          );
        } catch (error) {
          this.logger.error(
            `Failed to process cashback for voucher reload ${transactionId}: ${error.message}`,
          );
        }
      }

      return savedVoucher;
    });
  }

  async redeemVoucher(
    redeemDto: RedeemVoucherDto,
    requester?: { id: string; role?: string } | string,
  ): Promise<Voucher> {
    const { code, amount } = redeemDto;
    const requesterObj =
      typeof requester === 'string' ? { id: requester } : requester;

    return this.dataSource.transaction(async (manager) => {
      const voucherRepo = manager.getRepository(Voucher);
      const voucher = await this.lockAndLoadVoucher(voucherRepo, { code });

      if (!voucher) {
        throw new NotFoundException('Voucher not found.');
      }

      // --- Authorization: owner/buyer/recipient, issuing merchant, or admin ---
      if (requesterObj?.id) {
        const callerId = requesterObj.id;
        const callerRole = requesterObj.role;
        const isAdmin = callerRole === UserRole.ADMIN;
        const isOwner =
          voucher.owner?.id === callerId ||
          voucher.buyer?.id === callerId ||
          (voucher as any).recipient?.id === callerId ||
          (voucher as any).recipientId === callerId ||
          (voucher as any).ownerId === callerId ||
          (voucher as any).buyerId === callerId;
        const merchantId =
          (voucher.voucherProduct as any)?.user?.id ||
          (voucher.voucherProduct as any)?.userId;
        const isMerchant = !!merchantId && merchantId === callerId;

        if (!isAdmin && !isOwner && !isMerchant) {
          throw new ForbiddenException(
            'You are not authorized to redeem this voucher.',
          );
        }
      } else {
        // No caller context — deny by default to prevent anonymous code enumeration.
        throw new ForbiddenException(
          'Authentication context is required to redeem a voucher.',
        );
      }

      await this.validateVoucherForRedemption(voucher, manager);

      const product = voucher.voucherProduct;
      const redemptionAmount = amount ?? voucher.balance;

      if (redemptionAmount > voucher.balance) {
        throw new BadRequestException(
          'Redemption amount exceeds voucher balance.',
        );
      }

      // Partner-issued vouchers may not have a Mall voucher-product template.
      // They behave as spend-like balances, so partial redemption is allowed
      // unless an attached template explicitly forbids it.
      if (amount && product && product.allowPartialRedemption === false) {
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
          processedById: requesterObj?.id,
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
    const result = await entityManager.transaction(async (transactionalManager) => {
      const voucherRepo = transactionalManager.getRepository(Voucher);
      const voucher = await this.lockAndLoadVoucher(voucherRepo, { code });

      if (!voucher) {
        throw new NotFoundException('Voucher not found.');
      }

      // Authorization: only the voucher owner/buyer/recipient or the issuing
      // merchant may redeem it against an order. Bearer use is denied.
      const callerId = (order as any)?.user?.id;
      if (!callerId) {
        throw new ForbiddenException(
          'Authentication context is required to redeem a voucher.',
        );
      }
      const isOwner =
        voucher.owner?.id === callerId ||
        voucher.buyer?.id === callerId ||
        (voucher as any).recipient?.id === callerId ||
        (voucher as any).recipientId === callerId ||
        (voucher as any).ownerId === callerId ||
        (voucher as any).buyerId === callerId;
      const merchantId =
        (voucher.voucherProduct as any)?.user?.id ||
        (voucher.voucherProduct as any)?.userId;
      const isMerchant = !!merchantId && merchantId === callerId;
      if (!isOwner && !isMerchant) {
        throw new ForbiddenException(
          'You are not authorized to redeem this voucher.',
        );
      }

      await this.validateVoucherForRedemption(voucher, manager);

      const product = voucher.voucherProduct;
      const redemptionAmount = amount ?? voucher.balance;

      if (redemptionAmount > voucher.balance) {
        throw new BadRequestException(
          'Redemption amount exceeds voucher balance.',
        );
      }

      // Partner-issued vouchers may not have a Mall voucher-product template.
      // They behave as spend-like balances, so partial redemption is allowed
      // unless an attached template explicitly forbids it.
      if (amount && product && product.allowPartialRedemption === false) {
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

    if (!manager && result.issuanceId) {
      this.eventEmitter?.emit(PARTNER_INSTRUMENT_CONSUMED_EVENT, {
        issuanceId: result.issuanceId,
        code: result.code,
        instrumentType: InstrumentType.VOUCHER,
        instrumentId: result.id,
        amount: amount ?? Number(result.initialValue),
        note: 'voucher_redeemed_at_checkout',
      });
    }

    return result;
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
      relations: [
        'voucherProduct',
        'transactions',
        'owner',
        'owner.businesses',
      ],
    });
    if (!voucher) {
      throw new NotFoundException('Voucher not found.');
    }
    return voucher;
  }

  /**
   * Balance for a voucher the authenticated user is entitled to see.
   *
   * The public `GET /vouchers/:code` endpoint deliberately masks the balance.
   * Checkout needs it to let a shopper apply the voucher, so this method
   * authorises the caller first: they must own the voucher, or their account
   * email must match the reward recipient (covers vouchers materialised before
   * the shopper signed up).
   */
  async getOwnedVoucherBalance(code: string, user: User) {
    const voucher = await this.voucherRepository.findOne({
      where: { code },
      relations: ['voucherProduct', 'owner'],
    });
    if (!voucher) {
      throw new NotFoundException('Voucher not found.');
    }

    const ownerMatch = Boolean(voucher.owner?.id && voucher.owner.id === user.id);
    const emailMatch = Boolean(
      voucher.recipientEmail &&
        user.email &&
        voucher.recipientEmail.trim().toLowerCase() ===
          user.email.trim().toLowerCase(),
    );
    if (!ownerMatch && !emailMatch) {
      throw new ForbiddenException(
        'You do not have permission to view this voucher.',
      );
    }

    return {
      code: voucher.code,
      status: voucher.status,
      balance: Number(voucher.balance),
      currency: 'GBP',
      initialValue: Number(voucher.initialValue),
      expiresAt: voucher.expiresAt,
      allowPartialRedemption:
        voucher.voucherProduct?.allowPartialRedemption ?? true,
    };
  }

  async findPublicVoucherByCode(code: string) {
    const voucher = await this.voucherRepository.findOne({
      where: { code },
      relations: ['voucherProduct'],
    });
    if (!voucher) {
      throw new NotFoundException('Voucher not found.');
    }
    // Never expose balance, owner PII, or transaction history publicly —
    // callers must authenticate + prove ownership to redeem or view value.
    return {
      code: voucher.code,
      status: voucher.status,
      expiresAt: voucher.expiresAt,
      voucherProduct: voucher.voucherProduct
        ? {
            id: voucher.voucherProduct.id,
            name: voucher.voucherProduct.name,
            allowPartialRedemption:
              voucher.voucherProduct.allowPartialRedemption,
          }
        : null,
    };
  }

  /**
   * Consume a voucher against a service booking without requiring an Order.
   */
  async consumeForBooking(
    input: {
      code: string;
      amount: number;
      userId: string;
      businessId?: string;
      bookingId?: string;
    },
    manager?: EntityManager,
  ): Promise<void> {
    const amount = roundMoney(input.amount);
    if (amount <= 0) {
      throw new BadRequestException('Redemption amount must be positive.');
    }
    const entityManager = manager || this.dataSource.manager;
    let consumed: Voucher | null = null;

    await entityManager.transaction(async (transactionalManager) => {
      const voucherRepo = transactionalManager.getRepository(Voucher);
      const voucher = await this.lockAndLoadVoucher(voucherRepo, {
        code: input.code,
      });
      if (!voucher) throw new NotFoundException('Voucher not found.');

      const isOwner =
        voucher.owner?.id === input.userId ||
        voucher.buyer?.id === input.userId ||
        (voucher as any).recipient?.id === input.userId ||
        (voucher as any).ownerId === input.userId ||
        (voucher as any).buyerId === input.userId;
      if (!isOwner) {
        throw new ForbiddenException(
          'You are not authorized to redeem this voucher.',
        );
      }

      await this.validateVoucherForRedemption(voucher, transactionalManager);

      if (amount > Number(voucher.balance)) {
        throw new BadRequestException(
          'Redemption amount exceeds voucher balance.',
        );
      }
      if (
        voucher.voucherProduct &&
        !voucher.voucherProduct.allowPartialRedemption &&
        amount < Number(voucher.balance)
      ) {
        throw new BadRequestException(
          'This voucher does not allow partial redemption.',
        );
      }

      try {
        const dv = await this.digitalValueService.getByCode(input.code);
        await this.digitalValueService.redeem(
          dv.id,
          { amount, merchantId: input.businessId },
          transactionalManager,
        );
      } catch (e) {
        if (!(e instanceof NotFoundException)) throw e;
      }

      const balanceBefore = Number(voucher.balance);
      voucher.balance = roundMoney(balanceBefore - amount);
      const balanceAfter = Number(voucher.balance);
      voucher.status =
        balanceAfter === 0
          ? VoucherStatus.REDEEMED
          : VoucherStatus.PARTIALLY_REDEEMED;

      await this.createTransaction(
        {
          voucher,
          amount,
          type: TransactionType.REDEMPTION,
          balanceBefore,
          balanceAfter,
          processedById: input.userId,
          notes: `Redeemed for booking ${input.bookingId ?? ''}`.trim(),
        },
        transactionalManager,
      );

      consumed = await voucherRepo.save(voucher);
    });

    if (!manager && consumed?.issuanceId) {
      this.eventEmitter?.emit(PARTNER_INSTRUMENT_CONSUMED_EVENT, {
        issuanceId: consumed.issuanceId,
        code: consumed.code,
        instrumentType: InstrumentType.VOUCHER,
        instrumentId: consumed.id,
        amount,
        note: 'voucher_redeemed_for_booking',
      });
    }
  }

  async manuallyMarkAsRedeemed(
    code: string,
    staffId: string,
  ): Promise<Voucher> {
    const result = await this.dataSource.transaction(async (manager) => {
      const voucherRepo = manager.getRepository(Voucher);
      const voucher = await this.lockAndLoadVoucher(voucherRepo, { code });

      if (!voucher) {
        throw new NotFoundException('Voucher not found.');
      }

      // Authorization: only the issuing merchant may manually redeem a voucher.
      const merchantId =
        (voucher.voucherProduct as any)?.user?.id ||
        (voucher.voucherProduct as any)?.userId;
      if (!merchantId || merchantId !== staffId) {
        throw new ForbiddenException(
          'You are not authorized to redeem this voucher.',
        );
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

    if (result.issuanceId) {
      this.eventEmitter?.emit(PARTNER_INSTRUMENT_CONSUMED_EVENT, {
        issuanceId: result.issuanceId,
        code: result.code,
        instrumentType: InstrumentType.VOUCHER,
        instrumentId: result.id,
        amount: Number(result.initialValue),
        note: 'voucher_redeemed_manually',
      });
    }

    return result;
  }

  // --- Statistics and History ---

  async findAllVouchers(ownerId: string, query: VoucherHistoryQueryDto) {
    const qb = this.voucherRepository
      .createQueryBuilder('voucher')
      .leftJoinAndSelect('voucher.buyer', 'buyer')
      .leftJoinAndSelect('voucher.recipient', 'recipient')
      .leftJoinAndSelect('voucher.voucherProduct', 'voucherProduct')
      .where('voucher.ownerId = :ownerId', { ownerId })
      .orderBy('voucher.createdAt', query.order ?? 'DESC')
      .skip(query.skip ?? 0)
      .take(query.take ?? 50);

    if (query.startDate) {
      qb.andWhere('voucher.createdAt >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      qb.andWhere('voucher.createdAt <= :endDate', {
        endDate: query.endDate,
      });
    }

    const [vouchers, total] = await qb.getManyAndCount();

    const items = vouchers.map((voucher) => ({
      id: voucher.id,
      code: voucher.code,
      status: voucher.status,
      initialValue: voucher.initialValue,
      balance: voucher.balance,
      createdAt: voucher.createdAt,
      expiresAt: voucher.expiresAt,
      buyer: voucher.buyer
        ? {
            id: voucher.buyer.id,
            name: voucher.buyer.name,
            email: voucher.buyer.email,
          }
        : null,
      recipient: voucher.recipient
        ? { id: voucher.recipient.id, name: voucher.recipient.name }
        : null,
      product: voucher.voucherProduct
        ? {
            id: voucher.voucherProduct.id,
            name: voucher.voucherProduct.name,
          }
        : null,
    }));

    const pageMeta = new PageMetaDto({
      pageOptionsDto: query,
      itemCount: vouchers.length,
      totalItems: total,
    });

    return new PageDto(items, pageMeta);
  }

  async getVoucherProductAnalytics(productId: string): Promise<any> {
    const product = await this.voucherProductRepository.findOne({
      where: { id: productId },
      relations: ['vouchers'],
    });
    if (!product) {
      throw new NotFoundException(
        `Voucher product with ID ${productId} not found`,
      );
    }

    const vouchers = product.vouchers ?? [];
    const totalSold = vouchers.length;
    const totalRedeemed = vouchers.filter(
      (voucher) => voucher.status === 'redeemed',
    ).length;
    const totalValue = vouchers.reduce(
      (sum, voucher) => sum + Number(voucher.initialValue ?? 0),
      0,
    );
    const redeemedValue = vouchers.reduce(
      (sum, voucher) =>
        sum +
        (Number(voucher.initialValue ?? 0) - Number(voucher.balance ?? 0)),
      0,
    );
    const redemptionRate =
      totalSold > 0 ? Math.round((totalRedeemed / totalSold) * 100) : 0;

    return {
      product: {
        id: product.id,
        name: product.name,
        value: product.value,
        valueType: product.valueType,
      },
      metrics: {
        totalSold,
        totalRedeemed,
        redemptionRate,
        totalValue,
        redeemedValue,
        outstandingValue: totalValue - redeemedValue,
      },
      recentTransactions: vouchers.slice(0, 20),
    };
  }

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

  /**
   * Lock a voucher row without joins, then load its nullable relations.
   *
   * Postgres rejects `FOR UPDATE` on the nullable side of an outer join, which
   * TypeORM emits for `relations: [...]` + `pessimistic_write`. Locking the base
   * row first keeps redemption atomic without hitting that error.
   */
  private async lockAndLoadVoucher(
    voucherRepo: Repository<Voucher>,
    where: { code?: string; id?: string },
  ): Promise<Voucher | null> {
    const locked = await voucherRepo.findOne({
      where,
      lock: { mode: 'pessimistic_write' },
    });
    if (!locked) return null;
    return (
      (await voucherRepo.findOne({
        where: { id: locked.id },
        relations: [
          'voucherProduct',
          'voucherProduct.user',
          'owner',
          'buyer',
          'recipient',
        ],
      })) ?? locked
    );
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
  // --- Partner (ecosystem M2M) Integration Methods ---

  /**
   * Issue a voucher reward on behalf of an ecosystem partner (e.g. MCOM
   * Rewards). Called over the zero-hop service mesh — the caller is
   * authenticated by an RS256 service token, never a shared secret.
   */
  async createPartnerVoucher(payload: {
    amount: number;
    recipientEmail?: string;
    recipientName?: string;
    message?: string;
    businessName?: string;
    code?: string;
    issuanceId?: string;
    templateId?: string;
    businessId?: string;
    scope?: InstrumentScopeDto;
    metadata?: Record<string, any>;
    context?: PartnerRequestContext;
    expiresAt?: string;
  }): Promise<Voucher> {
    const amount = roundMoney(Number(payload.amount));
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Voucher amount must be positive.');
    }
    const {
      recipientEmail,
      recipientName,
      message,
      businessName,
      issuanceId,
    } = payload;
    const sourceApp = 'mcom-rewards';

    if (issuanceId) {
      const existing = await this.voucherRepository.findOne({
        where: { sourceApp, issuanceId },
      });
      if (existing) return markReplayed(existing);
    }

    const providedCode = (payload.code || '').trim();
    if (providedCode) {
      const existingCode = await this.voucherRepository.findOne({
        where: { code: providedCode },
      });
      if (existingCode) {
        if (issuanceId && existingCode.issuanceId !== issuanceId) {
          throw new ConflictException(
            'CODE_ALREADY_USED: this code belongs to a different issuance.',
          );
        }
        return markReplayed(existingCode);
      }
    }

    let product: VoucherProduct | null = null;
    if (payload.templateId) {
      product = await this.voucherProductRepository.findOne({
        where: { id: payload.templateId },
        relations: ['user'],
      });
      if (!product) throw new NotFoundException('Voucher product not found.');
      if (!product.isEnabled || product.status === 'inactive') {
        throw new UnprocessableEntityException('TEMPLATE_INACTIVE');
      }
      this.assertVoucherAmount(amount, product);
    }

    let business: Business | null = null;
    if (payload.businessId) {
      business = await this.businessRepository.findOne({
        where: { id: payload.businessId },
        relations: ['user'],
      });
      if (!business) throw new NotFoundException('Business not found.');
    } else if (product?.user?.id) {
      business = await this.businessRepository.findOne({
        where: { user: { id: product.user.id } },
        relations: ['user'],
      });
    }

    if (
      product &&
      business &&
      product.user?.id &&
      product.user.id !== business.user?.id
    ) {
      throw new ForbiddenException(
        'TEMPLATE_NOT_OWNED: the voucher product is not owned by the bound business.',
      );
    }

    const expiresAt = payload.expiresAt
      ? new Date(payload.expiresAt)
      : product?.expiryDays
        ? new Date(Date.now() + Number(product.expiryDays) * 86_400_000)
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    const owner = recipientEmail
      ? await this.userRepository.findOne({ where: { email: recipientEmail } })
      : null;

    const dv = await this.digitalValueService.create({
      type: DigitalValueType.VOUCHER,
      initialValue: amount,
      ownerId: owner?.id,
      metadata: {
        recipientEmail,
        recipientName,
        personalMessage: message,
        businessName,
        issuanceId: issuanceId ?? null,
        templateId: product?.id ?? null,
        businessId: business?.id ?? null,
      },
      expiryDate: expiresAt.toISOString(),
    });

    const newVoucher = this.voucherRepository.create({
      code: providedCode || dv.code,
      initialValue: amount,
      balance: amount,
      status: VoucherStatus.UNREDEEMED,
      expiresAt,
      owner: owner || null,
      buyer: owner || null,
      recipientEmail,
      recipientName,
      personalMessage: message || `Reward from ${businessName || 'MCOM Rewards'}`,
      voucherProduct: product || null,
      business: business || null,
      businessId: business?.id ?? null,
      issuanceId: issuanceId ?? null,
      sourceApp: issuanceId ? sourceApp : null,
      metadata: {
        ...(payload.metadata ?? {}),
        businessName,
        templateId: product?.id ?? null,
        allowPartialRedemption: product?.allowPartialRedemption ?? true,
        allowReloading: product?.allowReloading ?? false,
        usage: product?.usage ?? null,
      },
    });

    let savedVoucher: Voucher;
    try {
      savedVoucher = await this.voucherRepository.save(newVoucher);
    } catch (err: any) {
      if (err?.code === '23505') {
        const existing = issuanceId
          ? await this.voucherRepository.findOne({
              where: { sourceApp, issuanceId },
            })
          : await this.voucherRepository.findOne({
              where: { code: providedCode },
            });
        if (existing) {
          if (
            issuanceId &&
            existing.issuanceId &&
            existing.issuanceId !== issuanceId
          ) {
            throw new ConflictException(
              'CODE_ALREADY_USED: this code belongs to a different issuance.',
            );
          }
          return markReplayed(existing);
        }
      }
      throw err;
    }

    await this.createTransaction({
      voucher: savedVoucher,
      amount,
      type: TransactionType.PURCHASE,
      balanceBefore: 0,
      balanceAfter: amount,
      notes: `Generated by Loyalty System for ${businessName || 'MCOM Rewards'}`,
    });

    if (
      this.instrumentScopeService &&
      payload.context?.scopeEnabled !== false &&
      (payload.scope || business || product?.scopeConfig)
    ) {
      await this.instrumentScopeService.saveScope({
        instrumentType: InstrumentType.VOUCHER,
        instrumentId: savedVoucher.id,
        businessId: business?.id ?? null,
        scope: payload.scope,
        context: payload.context,
        templateScope: (product?.scopeConfig as any) ?? null,
        tenantBusinessId: business?.id ?? null,
      });
    }

    return savedVoucher;
  }

  private assertVoucherAmount(
    amount: number,
    product: VoucherProduct,
  ): void {
    const fixed = (product.fixedAmounts || []).map((value) => Number(value));
    const matchesFixed = fixed.includes(amount);
    const withinCustom =
      product.allowCustomAmount &&
      (product.minCustomAmount === null ||
        product.minCustomAmount === undefined ||
        amount >= Number(product.minCustomAmount)) &&
      (product.maxCustomAmount === null ||
        product.maxCustomAmount === undefined ||
        amount <= Number(product.maxCustomAmount));

    if (!matchesFixed && !withinCustom) {
      throw new UnprocessableEntityException(
        'AMOUNT_OUT_OF_RANGE: amount is not allowed by the voucher product.',
      );
    }
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

  async findProductById(id: string): Promise<VoucherProduct> {
    const product = await this.voucherProductRepository.findOne({
      where: { id },
      relations: ['user', 'user.businesses'],
    });

    if (!product) {
      throw new NotFoundException('Voucher product not found.');
    }

    return product;
  }
}

function roundMoney(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}
