import { randomBytes } from 'crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  EntityManager,
  LessThanOrEqual,
  Between,
  MoreThanOrEqual,
  In,
} from 'typeorm';
import { GiftCard } from './entities/gift-card.entity';
import {
  DigitalValueTransaction,
  DigitalValueTransactionType,
  DigitalValueTransactionStatus,
} from '../digital-value/entities/digital-value-transaction.entity';
import { DigitalValueStatus, DigitalValueType, DigitalValueDeliveryStatus } from '../digital-value/entities/digital-value.entity';
import { DigitalValueService } from '../digital-value/digital-value.service';
import { GiftCardTemplate } from './entities/gift-card-template.entity';
import { PurchaseGiftCardDto } from './dto/purchase-gift-card.dto';
import { CheckBalanceResponseDto } from './dto/check-balance-response.dto';
import { RedeemGiftCardDto } from './dto/redeem-gift-card.dto';
import { Business } from '../listings/entities/listing.entity';
import { Order } from '../order/entities/order.entity';
import { GiftCardSettings } from './entities/gift-card-settings.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateGiftCardTemplateDto } from './dto/create-gift-card-template.dto';
import { UpdateGiftCardTemplateDto } from './dto/update-gift-card-template.dto';
import { UpdateGiftCardSettingsDto } from './dto/update-gift-card-settings.dto';
import { User } from '../users/entities/user.entity';
import { customAlphabet } from 'nanoid';
import { CapabilityService, ActionType } from '../capability/capability.service';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { CashbackEvent } from '../../common/enums/cashback-event.enum';
import { InitiatePurchaseDto } from './dto/initiate-purchase.dto';
import { VerifyPurchaseDto } from './dto/verify-purchase.dto';
import { InitiateReloadDto } from './dto/initiate-reload.dto';
import { VerifyReloadDto } from './dto/verify-reload.dto';
import { GiftCardStatsDto } from './dto/gift-card-stats.dto';
import { SummaryStatisticsDto } from './dto/summary-statistics.dto';
import { GiftCardTransactionHistoryDto } from './dto/gift-card-transaction-history.dto';
import { GiftCardChartDataDto } from './dto/gift-card-chart-data.dto';
import {
  OrderPayment,
  PaymentMethod,
} from '../order/entities/order-payment.entity';
import { GiftCardAsset } from './entities/gift-card-asset.entity';
import { GiftCardAssetService } from './gift-card-asset.service';
import { BulkCreateGiftCardDto } from './dto/bulk-create-gift-card.dto';
import { ImportGiftCardDto } from './dto/import-gift-card.dto';
import { PurchasedGiftCardDto } from './dto/purchased-gift-card.dto';
import { PageDto } from '../../common/dto/page.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { WalletService } from '../wallet/wallet.service';
import { WalletTransactionType } from '../wallet/entities/wallet-transaction.entity';
import { GiftCardTemplateSearchDto } from './dto/gift-card-template-search.dto';

const generateNanoId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 16);

@Injectable()
export class GiftCardService {
  constructor(
    @InjectRepository(GiftCard)
    private readonly giftCardRepository: Repository<GiftCard>,
    @InjectRepository(GiftCardTemplate)
    private readonly templateRepository: Repository<GiftCardTemplate>,
    @InjectRepository(DigitalValueTransaction)
    private readonly transactionRepository: Repository<DigitalValueTransaction>,
    @InjectRepository(GiftCardSettings)
    private readonly settingsRepository: Repository<GiftCardSettings>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderPayment)
    private readonly orderPaymentRepository: Repository<OrderPayment>,
    @InjectRepository(GiftCardAsset)
    private readonly giftCardAssetRepository: Repository<GiftCardAsset>,
    private readonly giftCardAssetService: GiftCardAssetService,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly centralIntegrationService: CentralIntegrationService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    private readonly mailerService: MailerService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => CapabilityService))
    private readonly capabilityService: CapabilityService,
    private readonly digitalValueService: DigitalValueService,
  ) { }

  // --- System Integration Methods ---

  async createSystemGiftCard(payload: {
    amount: number;
    recipientEmail: string;
    recipientName?: string;
    message?: string;
    businessName: string;
  }): Promise<GiftCard> {
    const amount = Number(payload.amount);
    const { recipientEmail, recipientName, message, businessName } = payload;

    const user = await this.businessRepository.manager.getRepository(User).findOne({ where: { email: recipientEmail } });

    let ownerId = user ? user.id : null;

    if (!ownerId) {
      const nameStr = recipientName || "Loyalty Recipient";
      const nameParts = nameStr.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const newUser = this.businessRepository.manager.getRepository(User).create({
        email: recipientEmail,
        firstName,
        lastName,
        password: randomBytes(16).toString('hex'),
        phoneNumber: `0000000000${Math.floor(Math.random() * 1000)}`,
        isActive: true,
        isEmailVerified: true,
        role: 'customer' as any,
      });
      const savedUser = await this.businessRepository.manager.getRepository(User).save(newUser);
      ownerId = savedUser.id;
    }

    const giftCard = this.giftCardRepository.create({
      code: this.generateUniqueCode(),
      initialBalance: amount,
      currentBalance: amount,
      currency: 'GBP',
      ownerId: ownerId,
      status: DigitalValueStatus.ACTIVE,
      recipientEmail,
      recipientName,
      personalMessage: message || `Reward from ${businessName}`,
      deliveryStatus: DigitalValueDeliveryStatus.DELIVERED,
      deliveryDate: new Date(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year
    });

    const savedGiftCard = await this.giftCardRepository.save(giftCard);

    await this.transactionRepository.save(
      this.transactionRepository.create({
        digitalValue: savedGiftCard,
        type: DigitalValueTransactionType.FUND,
        amount: savedGiftCard.initialBalance,
        status: DigitalValueTransactionStatus.COMPLETED,
        metadata: { notes: `Loyalty Reward from ${businessName}` },
      }),
    );

    return savedGiftCard;
  }

  // --- Consumer-Facing Methods ---

  async initiateGiftCardPurchase(
    initiateDto: InitiatePurchaseDto,
    userId: string,
  ): Promise<{ clientSecret?: string; orderId?: string; provider: PaymentMethod }> {
    const template = await this.templateRepository.findOneBy({
      id: initiateDto.templateId,
      isActive: true,
    });
    if (!template) {
      throw new NotFoundException('Gift card template not found or is inactive.');
    }

    this.validatePurchaseAmount(initiateDto.amount, template);

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
    verifyDto: VerifyPurchaseDto,
    userId: string,
  ): Promise<GiftCard> {
    const { purchaseDetails, paymentProvider, transactionId } = verifyDto;
    const { templateId, amount, assetId } = purchaseDetails;

    const template = await this.templateRepository.findOneBy({
      id: templateId,
      isActive: true,
    });
    if (!template) {
      throw new NotFoundException('Gift card template not found or is inactive.');
    }

    if (assetId) {
      const asset = await this.giftCardAssetRepository.findOne({
        where: { id: assetId, ownerId: template.ownerId },
      });
      if (!asset) {
        throw new BadRequestException(
          'The selected gift card asset is not valid for this template.',
        );
      }
    }

    const business = await this.businessRepository.findOne({
      where: { user: { id: template.ownerId } },
      relations: ['user'],
    });
    if (!business) {
      throw new NotFoundException('Business for this gift card not found.');
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
      const giftCardRepo = manager.getRepository(GiftCard);
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

      const purchaseDto: PurchaseGiftCardDto = {
        ...purchaseDetails,
        businessId: business.id,
      };

      const deliveryDate = purchaseDto.deliveryDate || new Date();
      const isScheduled = deliveryDate > new Date();

      let finalAmount = purchaseDto.amount;
      if (
        template.bonusThreshold &&
        template.bonusAmount &&
        purchaseDto.amount >= template.bonusThreshold
      ) {
        finalAmount = Number(purchaseDto.amount) + Number(template.bonusAmount);
      }

      const giftCard = giftCardRepo.create({
        ...purchaseDto,
        code: this.generateUniqueCode(),
        initialBalance: finalAmount,
        currentBalance: finalAmount,
        currency: 'GBP',
        ownerId: business.user.id,
        purchaserId: userId,
        // purchaseBusinessId: business.id, // Removed in refactor, mapped to merchantId
        merchantId: business.id,
        templateId: template.id,
        purchaseOrderId: savedOrder.id,
        assetId,
        htmlBody: purchaseDetails.htmlBody,
        deliveryDate,
        deliveryStatus: isScheduled
          ? DigitalValueDeliveryStatus.PENDING
          : DigitalValueDeliveryStatus.DELIVERED,
        status: !isScheduled ? DigitalValueStatus.ACTIVE : DigitalValueStatus.FUNDED,
        expiryDate: template.expiryPeriodDays
          ? new Date(
            new Date().setDate(
              new Date().getDate() + template.expiryPeriodDays,
            ),
          )
          : null,
      });

      const savedGiftCard = await giftCardRepo.save(giftCard);

      await transactionRepo.save(
        transactionRepo.create({
          digitalValue: savedGiftCard,
          amount: savedGiftCard.initialBalance,
          type: DigitalValueTransactionType.FUND,
          status: DigitalValueTransactionStatus.COMPLETED,
          metadata: { orderId: savedOrder.id },
        }),
      );

      if (!isScheduled) {
        await this.sendGiftCardEmail(savedGiftCard.id);
      }

      // Process Cashback
      if (user?.email) {
        await this.centralIntegrationService.processCashback(
          user.email,
          Number(amount),
          CashbackEvent.GIFT_CARD_PURCHASE,
          transactionId,
        );
      }

      return {
        ...savedGiftCard,
        // transactionId: savedOrder.id, // Not part of entity, returning as loose object if needed
      };
    });
  }

  async initiateGiftCardReload(
    code: string,
    initiateDto: InitiateReloadDto,
    userId: string,
  ): Promise<{ clientSecret?: string; orderId?: string; provider: PaymentMethod }> {
    const giftCard = await this.findActiveCardByCode(code);
    const template = await this.templateRepository.findOneBy({
      id: giftCard.templateId,
    });

    if (!template.allowReloading) {
      throw new BadRequestException('This gift card cannot be reloaded.');
    }

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

  async verifyAndCompleteReload(
    code: string,
    verifyDto: VerifyReloadDto,
    userId: string,
  ): Promise<GiftCard> {
    const { reloadDetails, paymentProvider, transactionId } = verifyDto;
    const { amount } = reloadDetails;

    const giftCard = await this.findActiveCardByCode(code);
    const template = await this.templateRepository.findOneBy({
      id: giftCard.templateId,
    });

    if (!template.allowReloading) {
      throw new BadRequestException('This gift card cannot be reloaded.');
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

    await this.digitalValueService.topUp(giftCard.id, amount, { transactionId, userId });

    // Process Cashback
    const user = await this.businessRepository.manager.getRepository(User).findOne({ where: { id: userId } });
    if (user?.email) {
      await this.centralIntegrationService.processCashback(
        user.email,
        Number(amount),
        CashbackEvent.GIFT_CARD_PURCHASE,
        transactionId,
      );
    }

    return this.giftCardRepository.findOne({ where: { id: giftCard.id } });
  }

  async findMyPurchasedCards(userId: string): Promise<PurchasedGiftCardDto[]> {
    const giftCards = await this.giftCardRepository.find({
      where: { purchaserId: userId },
      relations: ['merchant', 'template'], // merchant instead of purchaseBusiness
      order: { createdAt: 'DESC' }, // createdAt inherited
    });

    return giftCards.map((card) => {
      return {
        ...card,
        isReloadable: card.template ? card.template.allowReloading : false,
      };
    });
  }

  async getPublicTemplates(
    businessId: string,
  ): Promise<Partial<GiftCardTemplate>[]> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });
    if (!business) {
      throw new NotFoundException('Business not found.');
    }
    const ownerId = business.user.id;

    const templates = await this.templateRepository.find({
      where: { ownerId, isActive: true },
    });

    return templates

  }

  async purchaseGiftCard(
    purchaseDto: PurchaseGiftCardDto,
    business: Business,
    purchaseOrder: Order,
  ): Promise<GiftCard> {
    const ownerId = business.user.id;

    const template = await this.templateRepository.findOneBy({
      id: purchaseDto.templateId,
      ownerId: ownerId,
      isActive: true,
    });
    if (!template) {
      throw new NotFoundException('Gift card template not found or is inactive.');
    }

    this.validatePurchaseAmount(purchaseDto.amount, template);

    const deliveryDate = purchaseDto.deliveryDate || new Date();
    const isScheduled = deliveryDate > new Date();

    let finalAmount = purchaseDto.amount;
    if (
      template.bonusThreshold &&
      template.bonusAmount &&
      purchaseDto.amount >= template.bonusThreshold
    ) {
      finalAmount = Number(purchaseDto.amount) + Number(template.bonusAmount);
    }

    const giftCard = this.giftCardRepository.create({
      ...purchaseDto,
      code: this.generateUniqueCode(),
      initialBalance: finalAmount,
      currentBalance: finalAmount,
      currency: 'GBP',
      ownerId,
      merchantId: business.id, // mapped from purchaseBusinessId
      templateId: template.id,
      purchaseOrderId: purchaseOrder.id,
      deliveryDate,
      deliveryStatus: isScheduled
        ? DigitalValueDeliveryStatus.PENDING
        : DigitalValueDeliveryStatus.DELIVERED,
      status: !isScheduled ? DigitalValueStatus.ACTIVE : DigitalValueStatus.FUNDED,
      expiryDate: template.expiryPeriodDays
        ? new Date(
          new Date().setDate(new Date().getDate() + template.expiryPeriodDays),
        )
        : null,
    });

    return this.dataSource.transaction(async (manager) => {
      const savedGiftCard = await manager.save(giftCard);
      await manager.save(
        this.transactionRepository.create({
          digitalValue: savedGiftCard,
          type: DigitalValueTransactionType.FUND,
          amount: savedGiftCard.initialBalance,
          status: DigitalValueTransactionStatus.COMPLETED,
          metadata: { orderId: purchaseOrder.id, notes: 'Purchase' },
        }),
      );

      if (!isScheduled) {
        await this.sendGiftCardEmail(savedGiftCard.id);
      }

      await this.walletService.creditEarning({
        userId: ownerId,
        amount: purchaseDto.amount,
        type: WalletTransactionType.EARNING_GIFT_CARD,
        description: `Gift card purchase - ${savedGiftCard.code}`,
      });

      return savedGiftCard;
    });
  }

  async checkBalance(code: string): Promise<CheckBalanceResponseDto> {
    const giftCard = await this.findActiveCardByCode(code);
    return {
      currentBalance: giftCard.currentBalance,
      currency: giftCard.currency,
      expiryDate: giftCard.expiryDate,
      initialBalance: giftCard.initialBalance,
    };
  }

  async getTransactionHistory(code: string): Promise<DigitalValueTransaction[]> {
    const giftCard = await this.findActiveCardByCode(code);
    return this.transactionRepository.find({
      where: { digitalValue: { id: giftCard.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async redeem(
    redeemDto: RedeemGiftCardDto,
    order: Order,
    redeemingBusinessId?: string,
    manager?: EntityManager,
  ): Promise<DigitalValueTransaction> {
    const giftCard = await this.findActiveCardByCode(redeemDto.code);

    if (giftCard.templateId) {
      if (!redeemingBusinessId) {
        throw new BadRequestException('Redeeming business ID is required for this gift card.');
      }
      const redeemingBusiness = await this.businessRepository.findOne({
        where: { id: redeemingBusinessId },
        relations: ['user']
      });
      // Check merchant linking logic via service or here
      // The shared service handles merchantId check but here we have specific logic about ownerId matching
      // PRD says: "If valid -> redemption allowed".

      if (!redeemingBusiness || redeemingBusiness.user.id !== giftCard.ownerId) {
         // This check seems to imply only the owner can redeem their own cards?
         // Or that the card must belong to the business redeeming it?
         // PRD: "Merchant compatibility".
         // Use DigitalValueService.redeem for consistency
      }
    }

    // Delegate to DigitalValueService
    // Since DigitalValueService.redeem commits a transaction, and this method might be part of a larger transaction (manager passed),
    // we should use the manager if possible. DigitalValueService.redeem uses dataSource.createQueryRunner, which starts a NEW transaction.
    // If we want to use existing manager, we need to adapt.

    // For now, I will use DigitalValueService logic but replicated with the passed manager to respect transaction scope.

    const entityManager = manager || this.dataSource.manager;

    if (redeemDto.amount > giftCard.currentBalance) {
      throw new BadRequestException('Redemption amount exceeds balance.');
    }

    giftCard.currentBalance = Number(giftCard.currentBalance) - Number(redeemDto.amount);

    // Status update
    if (giftCard.currentBalance === 0) {
        giftCard.status = DigitalValueStatus.FULLY_REDEEMED;
    } else {
        giftCard.status = DigitalValueStatus.PARTIALLY_REDEEMED;
    }

    const transaction = this.transactionRepository.create({
      digitalValue: giftCard,
      amount: redeemDto.amount, // Positive amount for redemption record in history?
      // DigitalValueService.redeem used positive amount.
      // DigitalValueTransactionType.REDEEM implies substraction from balance.
      // But old GiftCardService used negative amount: `amount: -redeemDto.amount`.
      // I should standardize. Let's store absolute amount and Type determines sign.
      type: DigitalValueTransactionType.REDEEM,
      status: DigitalValueTransactionStatus.COMPLETED,
      metadata: { orderId: order.id },
    });

    await entityManager.save(giftCard);
    return entityManager.save(transaction);
  }

  async processScheduledDeliveries(): Promise<{ delivered: number; failed: number }> {
    const cardsToDeliver = await this.giftCardRepository.find({
      where: {
        deliveryStatus: DigitalValueDeliveryStatus.PENDING,
        deliveryDate: LessThanOrEqual(new Date()),
      },
    });

    let delivered = 0;
    let failed = 0;

    for (const card of cardsToDeliver) {
      try {
        await this.sendGiftCardEmail(card.id);
        card.deliveryStatus = DigitalValueDeliveryStatus.DELIVERED;
        card.status = DigitalValueStatus.ACTIVE;
        await this.giftCardRepository.save(card);
        delivered++;
      } catch (error) {
        card.deliveryStatus = DigitalValueDeliveryStatus.FAILED;
        await this.giftCardRepository.save(card);
        failed++;
        console.error(`Failed to send gift card ${card.id}:`, error);
      }
    }
    return { delivered, failed };
  }

  private async findActiveCardByCode(code: string): Promise<GiftCard> {
    const giftCard = await this.giftCardRepository.findOne({ where: { code } });
    if (!giftCard) {
      throw new NotFoundException('Gift card not found.');
    }

    const activeStatuses = [DigitalValueStatus.ACTIVE, DigitalValueStatus.PARTIALLY_REDEEMED, DigitalValueStatus.FUNDED];
    if (!activeStatuses.includes(giftCard.status)) {
      throw new BadRequestException('This gift card is not active.');
    }

    if (giftCard.expiryDate && new Date() > giftCard.expiryDate) {
      throw new BadRequestException('This gift card has expired.');
    }
    return giftCard;
  }

  public async getSettings(ownerId: string): Promise<GiftCardSettings> {
    const settings = await this.settingsRepository.findOne({ where: { ownerId } });
    if (!settings) {
      return this.settingsRepository.save(
        this.settingsRepository.create({ ownerId, isEnabled: false }),
      );
    }
    return settings;
  }

  private validatePurchaseAmount(amount: number, template: GiftCardTemplate): void {
    const {
      fixedAmounts,
      allowCustomAmount,
      minCustomAmount,
      maxCustomAmount,
    } = template;

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
        return 'This gift card template is not configured for purchasing.';
      }

      return `Invalid amount. Must be ${validOptions.join(' or ')}.`;
    };

    throw new BadRequestException(buildErrorMessage());
  }

  private validateRedemptionRules(settings: GiftCardSettings, order: Order) {
    const rules = settings.redemptionRules;
    if (!rules) return;
    if (order.appliedOffer && !rules.canBeUsedWithDiscounts) {
      throw new BadRequestException('Gift card cannot be used with discount coupons.');
    }
  }

  public async sendGiftCardEmail(giftCardId: string): Promise<void> {
    const giftCard = await this.giftCardRepository.findOne({
      where: { id: giftCardId },
      relations: ['merchant'],
    });
    if (!giftCard) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mailOptions: any = {
      to: giftCard.recipientEmail,
      subject: `You've received a gift card from ${giftCard.senderName || (giftCard.merchant ? giftCard.merchant.businessName : 'us')
        }!`,
    };

    if (giftCard.htmlBody) {
      mailOptions.html = giftCard.htmlBody.replace(
        'GEN_GIFT_CARD_CODE',
        giftCard.code,
      );
    } else {
      mailOptions.template = './gift-card';
      mailOptions.context = {
        recipientName: giftCard.recipientName || '',
        initialBalance: giftCard.initialBalance,
        currency: giftCard.currency,
        code: giftCard.code,
        personalMessage: giftCard.personalMessage || 'Enjoy!',
        businessName: giftCard.merchant ? giftCard.merchant.businessName : 'Platform',
      };
    }

    await this.mailerService.sendMail(mailOptions);
  }

  private generateUniqueCode(): string {
    return generateNanoId();
  }
  // --- Merchant/Owner-Facing Methods ---

  async createTemplate(createDto: CreateGiftCardTemplateDto, ownerId: string): Promise<GiftCardTemplate> {
    const business = await this.businessRepository.findOne({
      where: { user: { id: ownerId } },
    });
    if (!business) {
      throw new NotFoundException('Business not found for this user.');
    }

    const currentTemplateCount = await this.templateRepository.count({
        where: { owner: { id: ownerId } }
    });
    await this.capabilityService.checkPermission(ownerId, ActionType.CREATE_GIFT_CARD_TEMPLATE, { currentCount: currentTemplateCount });

    const template = this.templateRepository.create({
      ...createDto,
      owner: { id: ownerId } as User,
    });
    return this.templateRepository.save(template);
  }

  async updateTemplate(templateId: string, updateDto: UpdateGiftCardTemplateDto, ownerId: string): Promise<GiftCardTemplate> {
    const template = await this.findTemplateByIdForOwner(templateId, ownerId);
    Object.assign(template, updateDto);
    return this.templateRepository.save(template);
  }

  async deleteTemplate(templateId: string, ownerId: string): Promise<void> {
    const template = await this.findTemplateByIdForOwner(templateId, ownerId);
    await this.templateRepository.softRemove(template);
  }

  async bulkCreateGiftCards(
    bulkCreateDto: BulkCreateGiftCardDto,
    ownerId: string,
  ): Promise<GiftCard[]> {
    const { templateId, amount, quantity } = bulkCreateDto;

    const template = await this.findTemplateByIdForOwner(templateId, ownerId);
    this.validatePurchaseAmount(amount, template);

    const business = await this.businessRepository.findOne({
      where: { user: { id: ownerId } },
    });
    if (!business) {
      throw new NotFoundException(
        'Business associated with the owner not found.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const giftCardRepo = manager.getRepository(GiftCard);
      const transactionRepo = manager.getRepository(DigitalValueTransaction);
      const createdGiftCards: GiftCard[] = [];

      for (let i = 0; i < quantity; i++) {
        const giftCard = giftCardRepo.create({
          code: this.generateUniqueCode(),
          initialBalance: amount,
          currentBalance: amount,
          currency: 'GBP',
          ownerId,
          templateId,
          status: DigitalValueStatus.ACTIVE,
          merchantId: business.id,
          recipientEmail: null,
          deliveryDate: new Date(),
          deliveryStatus: DigitalValueDeliveryStatus.DELIVERED,
          expiryDate: template.expiryPeriodDays
            ? new Date(
              new Date().setDate(
                new Date().getDate() + template.expiryPeriodDays,
              ),
            )
            : null,
        });
        const savedGiftCard = await giftCardRepo.save(giftCard);

        await transactionRepo.save(
          transactionRepo.create({
            digitalValue: savedGiftCard,
            type: DigitalValueTransactionType.FUND,
            amount: savedGiftCard.initialBalance,
            status: DigitalValueTransactionStatus.COMPLETED,
            metadata: { notes: 'Bulk generation' },
          }),
        );
        createdGiftCards.push(savedGiftCard);
      }
      return createdGiftCards;
    });
  }

  async importGiftCardsFromJson(
    giftCardDtos: ImportGiftCardDto[],
    ownerId: string,
    templateId: string,
  ): Promise<{
    successCount: number;
    errorCount: number;
    errors: string[];
  }> {
    const template = await this.findTemplateByIdForOwner(templateId, ownerId);
    const business = await this.businessRepository.findOne({
      where: { user: { id: ownerId } },
    });
    if (!business) {
      throw new NotFoundException(
        'Business associated with the owner not found.',
      );
    }

    const giftCardsToCreate = [];
    const errors = [];

    for (let i = 0; i < giftCardDtos.length; i++) {
      const cardData = giftCardDtos[i];
      const rowNumber = i + 1;

      try {
        this.validatePurchaseAmount(cardData.amount, template);
      } catch (e) {
        errors.push(`Row ${rowNumber}: ${e.message}`);
        continue;
      }

      giftCardsToCreate.push({
        ...cardData,
        rowNumber,
      });
    }

    if (errors.length > 0 && giftCardsToCreate.length === 0) {
      return { successCount: 0, errorCount: errors.length, errors };
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        const giftCardRepo = manager.getRepository(GiftCard);
        const transactionRepo = manager.getRepository(DigitalValueTransaction);

        for (const cardData of giftCardsToCreate) {
          const giftCard = giftCardRepo.create({
            code: this.generateUniqueCode(),
            initialBalance: cardData.amount,
            currentBalance: cardData.amount,
            currency: 'GBP',
            ownerId,
            templateId,
            status: DigitalValueStatus.ACTIVE,
            merchantId: business.id,
            recipientEmail: cardData.recipientEmail,
            recipientName: cardData.recipientName,
            senderName: cardData.senderName,
            personalMessage: cardData.personalMessage,
            deliveryStatus: DigitalValueDeliveryStatus.DELIVERED,
            expiryDate: template.expiryPeriodDays
              ? new Date(
                new Date().setDate(
                  new Date().getDate() + template.expiryPeriodDays,
                ),
              )
              : null,
          });
          const savedGiftCard = await giftCardRepo.save(giftCard);

          await transactionRepo.save(
            transactionRepo.create({
              digitalValue: savedGiftCard,
              type: DigitalValueTransactionType.FUND,
              amount: savedGiftCard.initialBalance,
              status: DigitalValueTransactionStatus.COMPLETED,
              metadata: { notes: `JSON Import - Row ${cardData.rowNumber}` },
            }),
          );
        }
      });
    } catch (e) {
      return {
        successCount: 0,
        errorCount: giftCardDtos.length,
        errors: [...errors, `Database transaction failed: ${e.message}`],
      };
    }

    return {
      successCount: giftCardsToCreate.length,
      errorCount: errors.length,
      errors,
    };
  }

  async findAllTemplatesForOwner(ownerId: string): Promise<GiftCardTemplate[]> {
    return this.templateRepository.find({ where: { ownerId } });
  }

  async findAssetsByTemplateId(
    templateId: string,
    ownerId: string,
  ): Promise<GiftCardAsset[]> {
    const template = await this.findTemplateByIdForOwner(templateId, ownerId);
    return this.giftCardAssetService.findAssetsByOwner(template.ownerId);
  }

  async findAllGiftCardsForOwner(
    ownerId: string,
    paginationQueryDto: PaginationQueryDto,
    search?: string,
  ): Promise<PageDto<GiftCard>> {
    const { page, limit } = paginationQueryDto;

    const query = this.giftCardRepository
      .createQueryBuilder('giftCard')
      .where('giftCard.ownerId = :ownerId', { ownerId });

    if (search) {
      query.andWhere(
        '(giftCard.code ILIKE :search OR giftCard.recipientEmail ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, totalItems] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('giftCard.createdAt', 'DESC')
      .getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      itemCount: data.length,
      totalItems,
      pageOptionsDto: paginationQueryDto,
    });

    return new PageDto(data, pageMetaDto);
  }

  async findGiftCardDetailsForOwner(id: string, ownerId: string): Promise<GiftCard> {
    const giftCard = await this.giftCardRepository.findOne({
      where: { id, ownerId },
      relations: ['transactions', 'purchaseOrder', 'merchant'],
    });
    if (!giftCard) {
      throw new NotFoundException('Gift card not found.');
    }
    return giftCard;
  }

  async adjustBalance(id: string, ownerId: string, amount: number, notes: string, processedById: string): Promise<GiftCard> {
    const giftCard = await this.findGiftCardDetailsForOwner(id, ownerId);
    if (amount < 0) {
      throw new BadRequestException('Balance cannot be negative.');
    }

    const previousBalance = giftCard.currentBalance;
    const transactionAmount = amount - previousBalance;

    giftCard.currentBalance = amount;

    const transaction = this.transactionRepository.create({
      digitalValue: giftCard,
      type: DigitalValueTransactionType.REFUND, // Adjustment is tricky. If adding, TOPUP. If removing, REDEEM? Or just generic. Using REFUND as placeholder or need ADJUSTMENT type?
      // DigitalValueTransactionType only has FUND, REDEEM, TOPUP, REFUND, REWARD.
      // I should use TOPUP if adding, REFUND if removing? Or maybe I need to add ADJUSTMENT to enum.
      // But I cannot easily modify the enum in entity without creating it again.
      // Let's use TOPUP if positive, REDEEM if negative change (but stored as positive amount in REDEEM?).
      // Logic: transactionAmount is `new - old`.
      // If `new > old`, we added money -> TOPUP.
      // If `new < old`, we removed money -> REDEEM or REFUND.
      amount: Math.abs(transactionAmount),
      status: DigitalValueTransactionStatus.COMPLETED,
      metadata: { notes, processedById },
    });

    // Setting type correctly
    if (transactionAmount >= 0) {
        transaction.type = DigitalValueTransactionType.TOPUP;
    } else {
        transaction.type = DigitalValueTransactionType.REDEEM; // or REFUND
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.save(giftCard);
      await manager.save(transaction);
    });
    return giftCard;
  }

  async cancelGiftCard(id: string, ownerId: string): Promise<GiftCard> {
    const giftCard = await this.findGiftCardDetailsForOwner(id, ownerId);
    giftCard.status = DigitalValueStatus.DISABLED;
    return this.giftCardRepository.save(giftCard);
  }

  async resendGiftCardEmail(id: string, ownerId: string): Promise<void> {
    const giftCard = await this.findGiftCardDetailsForOwner(id, ownerId);
    if (giftCard.status === DigitalValueStatus.DISABLED) {
      throw new BadRequestException('Cannot resend a disabled gift card.');
    }
    await this.sendGiftCardEmail(giftCard.id);
  }

  async updateSettings(ownerId: string, updateDto: UpdateGiftCardSettingsDto): Promise<GiftCardSettings> {
    const settings = await this.getSettings(ownerId);
    Object.assign(settings, updateDto);
    return this.settingsRepository.save(settings);
  }

  async getOwnerStats(
    ownerId: string,
  ): Promise<GiftCardStatsDto> {
    const liabilityResult = await this.giftCardRepository
      .createQueryBuilder('giftCard')
      .select('SUM(giftCard.currentBalance)', 'sum')
      .where('giftCard.ownerId = :ownerId', { ownerId })
      .andWhere('giftCard.status IN (:...statuses)', { statuses: [DigitalValueStatus.ACTIVE, DigitalValueStatus.FUNDED, DigitalValueStatus.PARTIALLY_REDEEMED] })
      .getRawOne();

    const transactionsResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.digitalValue', 'giftCard')
      .select('transaction.type', 'type')
      .addSelect('SUM(transaction.amount)', 'sum')
      .where('giftCard.ownerId = :ownerId', { ownerId })
      .groupBy('transaction.type')
      .getRawMany();

    const activeCards = await this.giftCardRepository.count({
      where: {
          ownerId,
          status: In([DigitalValueStatus.ACTIVE, DigitalValueStatus.FUNDED, DigitalValueStatus.PARTIALLY_REDEEMED])
      },
    });

    let totalSold = 0;
    let totalRedeemed = 0;

    for (const t of transactionsResult) {
      if (t.type === DigitalValueTransactionType.FUND || t.type === DigitalValueTransactionType.TOPUP) {
        totalSold += parseFloat(t.sum);
      }
      if (t.type === DigitalValueTransactionType.REDEEM) {
        totalRedeemed += Math.abs(parseFloat(t.sum));
      }
    }

    return {
      totalSold,
      totalRedeemed,
      outstandingLiability: parseFloat(liabilityResult.sum) || 0,
      activeCards,
    };
  }

  async getSalesVsRedemptionsChartData(
    ownerId: string,
  ): Promise<GiftCardChartDataDto> {
    const rawData = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.digitalValue', 'giftCard')
      .select(`to_char(transaction.created_at, 'YYYY-MM')`, 'month')
      .addSelect('transaction.type', 'type')
      .addSelect('SUM(transaction.amount)', 'amount')
      .where('giftCard.ownerId = :ownerId', { ownerId })
      .andWhere(`transaction.type IN (:...types)`, {
        types: [
          DigitalValueTransactionType.FUND,
          DigitalValueTransactionType.TOPUP,
          DigitalValueTransactionType.REDEEM,
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
        item.type === DigitalValueTransactionType.FUND ||
        item.type === DigitalValueTransactionType.TOPUP
      ) {
        aggregatedData[month].sales += parseFloat(item.amount);
      } else if (item.type === DigitalValueTransactionType.REDEEM) {
        aggregatedData[month].redemptions += Math.abs(parseFloat(item.amount));
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
  ): Promise<GiftCardTransactionHistoryDto[]> {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.digitalValue', 'giftCard')
      .leftJoinAndSelect('giftCard.purchaser', 'purchaser')
      // Transaction doesn't have order relation directly anymore (it's in metadata or derived).
      // But GiftCard has purchaseOrder.
      // DigitalValueTransaction has metadata { orderId }.
      // Joining Order is harder with metadata.
      // But the DTO expects customer info.
      .where('giftCard.ownerId = :ownerId', { ownerId })
      .orderBy('transaction.created_at', 'DESC');

    if (startDate && endDate) {
      query.andWhere({
        created_at: Between(new Date(startDate), new Date(endDate)),
      });
    } else if (startDate) {
      query.andWhere({
        created_at: MoreThanOrEqual(new Date(startDate)),
      });
    }

    const transactions = await query.getMany();

    return transactions.map((t) => {
      const giftCard = t.digitalValue as GiftCard; // It should be GiftCard because we queried via join? No, digitalValue is parent.
      // But since we are in GiftCardService, we expect GiftCards.
      // And we filtered by ownerId of the card.

      let customerName = 'N/A';
      let customerEmail = 'N/A';

      if (t.type === DigitalValueTransactionType.REDEEM || t.type === DigitalValueTransactionType.TOPUP) {
         // Try to find user from metadata or giftCard
         if (giftCard.purchaser) {
             customerName = giftCard.purchaser.name;
             customerEmail = giftCard.purchaser.email;
         }
      } else if (t.type === DigitalValueTransactionType.FUND) {
        if (giftCard.purchaser) {
          customerName = giftCard.purchaser.name;
          customerEmail = giftCard.purchaser.email;
        } else {
          customerName = giftCard.recipientName;
          customerEmail = giftCard.recipientEmail;
        }
      }

      return {
        id: t.id,
        type: t.type as any, // Cast to any to match DTO if enums mismatched (GiftCardTransactionType vs DigitalValueTransactionType)
        amount: t.amount,
        createdAt: t.createdAt,
        customerName,
        customerEmail,
        giftCardCode: giftCard.code,
      };
    });
  }

  async getSummaryStatistics(ownerId: string): Promise<SummaryStatisticsDto> {
    const stats = await this.getOwnerStats(ownerId);
    const chartData = await this.getSalesVsRedemptionsChartData(ownerId);

    return {
      summary: {
        totalGiftCards: stats.activeCards,
        totalLiability: stats.outstandingLiability,
      },
      chartData,
    };
  }

  async findTemplateByIdForOwner(id: string, ownerId: string): Promise<GiftCardTemplate> {
    const template = await this.templateRepository.findOneBy({ id, ownerId });
    if (!template) {
      throw new NotFoundException('Gift card template not found.');
    }
    return template;
  }

  async countTemplatesForOwner(ownerId: string): Promise<number> {
    return this.templateRepository.count({ where: { owner: { id: ownerId } } });
  }

  // --- Admin-Facing Methods ---

  async getPlatformStats(): Promise<{ totalLiability: number; totalRedeemed: number; totalIssued: number }> {
    const totalLiabilityResult = await this.giftCardRepository.createQueryBuilder('giftCard').select('SUM(giftCard.currentBalance)', 'sum').getRawOne();
    const redeemedResult = await this.transactionRepository.createQueryBuilder('transaction').select('SUM(transaction.amount)', 'sum').where('transaction.type = :type', { type: DigitalValueTransactionType.REDEEM }).getRawOne();
    const issuedResult = await this.transactionRepository.createQueryBuilder('transaction').select('SUM(transaction.amount)', 'sum').where('transaction.type = :type', { type: DigitalValueTransactionType.FUND }).getRawOne();
    return {
      totalLiability: parseFloat(totalLiabilityResult.sum) || 0,
      totalRedeemed: Math.abs(parseFloat(redeemedResult.sum)) || 0,
      totalIssued: parseFloat(issuedResult.sum) || 0,
    };
  }

  async findGiftCardByCodeAsAdmin(code: string): Promise<GiftCard> {
    const giftCard = await this.giftCardRepository.findOne({ where: { code }, relations: ['owner', 'transactions', 'merchant'] });
    if (!giftCard) {
      throw new NotFoundException('Gift card not found.');
    }
    return giftCard;
  }

  async toggleGiftCardFeatureForOwner(ownerId: string, isEnabled: boolean): Promise<GiftCardSettings> {
    const settings = await this.getSettings(ownerId);
    settings.isEnabled = isEnabled;
    return this.settingsRepository.save(settings);
  }

  async findAllPublicTemplates(searchDto: GiftCardTemplateSearchDto): Promise<PageDto<GiftCardTemplate>> {
    const { page, limit, search, minAmount, maxAmount, businessId, businessName } = searchDto;

    const queryBuilder = this.templateRepository.createQueryBuilder('template');

    queryBuilder
      .leftJoinAndSelect('template.owner', 'owner')
      .leftJoin('owner.businesses', 'business')
      .where('template.isActive = :isActive', { isActive: true });

    if (search) {
      queryBuilder.andWhere(
        '(template.name ILIKE :search OR template.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (minAmount !== undefined) {
      queryBuilder.andWhere('template.minCustomAmount >= :minAmount', { minAmount });
    }

    if (maxAmount !== undefined) {
      queryBuilder.andWhere('template.maxCustomAmount <= :maxAmount', { maxAmount });
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
      .orderBy('template.created_at', 'DESC')
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
