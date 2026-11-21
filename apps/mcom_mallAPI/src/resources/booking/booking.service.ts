import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  In,
  LessThan,
  MoreThan,
  Repository,
} from 'typeorm';

import { Business } from '../listings/entities/listing.entity';
import { UserRole } from '../../common/role.enum';
import { ListingType, BusinessStatus } from '../listings/listing.enum';
import { NotificationType } from '../notification/notification.enum';
import { NotificationService } from '../notification/notification.service';
import { PaymentMethod } from '../order/entities/order-payment.entity';
import {
  PaypalPayoutBatch,
  PaymentProviderService,
} from '../payments/services/payment-provider.service';
import { PaymentOrchestratorService } from '../payments/services/payment-orchestrator.service';
import {
  McomPayIntent,
  McomPaySplit,
} from '../payments/services/mcom-pay.service';
import {
  allocateCashSplits,
  WeightedSplit,
} from '../payments/services/payment-splits.util';
import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { CashbackEvent } from '../../common/enums/cashback-event.enum';
import { Service } from '../services/entities/service.entity';
import { WalletTransactionType } from '../wallet/entities/wallet-transaction.entity';
import { WalletService } from '../wallet/wallet.service';
import { EmailService } from '../email/email.service';
import { BlockSlotDto } from './dto/block-slot.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { IntegrationSetting } from '../settings/entities/integration-setting.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InitiateBookingPaymentDto } from './dto/initiate-booking-payment.dto';
import { PriceModifierDto } from './dto/price-modifier.dto';
import { VerifyBookingPaymentDto } from './dto/verify-booking-payment.dto';
import { BookingStatus } from './entities/booking.enum';
import { BlockedSlot } from './entities/blocked-slot.entity';
import { PriceModifier } from './entities/price-modifier.entity';
import { ServiceBooking } from './entities/service-booking.entity';
import { ServicePayment } from './entities/service-payment.entity';
import {
  BookingTransaction,
  TransactionType,
  TransactionStatus,
} from './entities/booking-transaction.entity';
import { BookingReward, BookingRewardStatus } from './entities/booking-reward.entity';
import {
  RewardOutboxOperation,
  RewardOutboxStatus,
  RewardRedemptionOutbox,
} from '../order/entities/reward-redemption-outbox.entity';
import { User } from '../users/entities/user.entity';
import { RewardsClientService } from '../rewards-integration/rewards-client.service';
import { RewardsEligibilityService } from '../rewards-integration/rewards-eligibility.service';
import { EligibilityLine } from '../rewards-integration/interfaces/reward-issuance.interface';
import { InstrumentScopeService } from '../partner-instruments/instrument-scope.service';
import { PartnerCallbackService } from '../partner-instruments/partner-callback.service';
import { InstrumentType, ScopeLine, ScopeMode } from '../partner-instruments/enums';
import { CouponService } from '../coupon/coupon.service';
import {
  computeCouponDiscount,
  computeInstrumentApplication,
} from '../partner-instruments/pricing';
import { GiftCardService } from '../gift-card/gift-card.service';
import { VoucherService } from '../voucher/voucher.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { MoneyEngineService } from '../money-engine/money-engine.service';
import { FunctionalType } from '../money-engine/entities/reward-definition.entity';
import { FeatureFlagsService } from '../../common/feature-flags/feature-flags.service';
import { VoucherStatus } from '../voucher/entities/voucher.entity';
import { ApprovalStatus } from '../../common/moderation/catalog-approval';
import { randomUUID } from 'crypto';

const DAY_NAMES = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  /**
   * `DayOfWeek` is a numeric enum, but business hours can legitimately be
   * persisted as either the enum value (`1`) or its label (`"MONDAY"`)
   * depending on which client wrote the row. Compare against the date's
   * numeric day so both representations match.
   */
  private isDayMatch(value: unknown, targetDate: Date): boolean {
    const targetIndex = targetDate.getDay();
    if (typeof value === 'number') return value === targetIndex;
    if (value === null || value === undefined || value === '') return false;
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric === targetIndex;
    return String(value).trim().toUpperCase() === DAY_NAMES[targetIndex];
  }

  constructor(
    @InjectRepository(BlockedSlot)
    private readonly blockedSlotRepository: Repository<BlockedSlot>,
    @InjectRepository(PriceModifier)
    private readonly priceModifierRepository: Repository<PriceModifier>,
    @InjectRepository(ServiceBooking)
    private readonly bookingRepository: Repository<ServiceBooking>,
    @InjectRepository(ServicePayment)
    private readonly servicePaymentRepository: Repository<ServicePayment>,
    @InjectRepository(BookingTransaction)
    private readonly bookingTransactionRepository: Repository<BookingTransaction>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(BookingReward)
    private readonly bookingRewardRepository: Repository<BookingReward>,
    @InjectRepository(RewardRedemptionOutbox)
    private readonly rewardOutboxRepository: Repository<RewardRedemptionOutbox>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly paymentOrchestrator: PaymentOrchestratorService,
    private readonly centralIntegrationService: CentralIntegrationService,
    private readonly emailService: EmailService,
    private readonly rewardsClient: RewardsClientService,
    private readonly rewardsEligibility: RewardsEligibilityService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    private readonly instrumentScopeService: InstrumentScopeService,
    private readonly partnerCallbacks: PartnerCallbackService,
    @Inject(forwardRef(() => CouponService))
    private readonly couponService: CouponService,
    @Inject(forwardRef(() => GiftCardService))
    private readonly giftCardService: GiftCardService,
    @Inject(forwardRef(() => VoucherService))
    private readonly voucherService: VoucherService,
    private readonly loyaltyService: LoyaltyService,
    private readonly moneyEngineService: MoneyEngineService,
    private readonly featureFlags: FeatureFlagsService,
  ) {}

  async checkAvailability(checkAvailabilityDto: CheckAvailabilityDto): Promise<{
    isAvailable: boolean;
    priceMultiplier: number;
    reason?: string;
  }> {
    const { serviceId, startTime, endTime } = checkAvailabilityDto;

    const service = await this.serviceRepository.findOne({
      where: {
        id: serviceId,
        isActive: true,
        status: 'published',
        approvalStatus: ApprovalStatus.APPROVED,
        adminDisabled: false,
      },
      relations: ['business', 'business.user', 'business.businessHours'],
    });

    if (!service) {
      throw new NotFoundException('Active service not found.');
    }

    if (service.business.status !== BusinessStatus.PUBLISHED) {
      throw new BadRequestException(
        'Business is not currently active and cannot accept bookings.',
      );
    }

    if (!service.business.user || !service.business.user.isActive) {
      throw new BadRequestException('The owner of the business is not active.');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new BadRequestException('End time must be after start time.');
    }

    // Get Capacity (max concurrent bookings) for this day
    let maxConcurrent = 1;
    let isOpen = false;
    let openTimeStr = '';
    let closeTimeStr = '';
    let is24h = false;

    // 1. Check from Business Hours
    const businessHour = service.business.businessHours?.find((bh) =>
      this.isDayMatch(bh.dayOfWeek, start),
    );

    if (businessHour) {
      isOpen = true;
      openTimeStr = businessHour.openTime;
      closeTimeStr = businessHour.closeTime;
      is24h = businessHour.is24h;
    }

    // 2. Check Service Level Availability JSON (granular day settings)
    if (service.availability?.schedule) {
      const daySched = service.availability.schedule.find((s: any) =>
        this.isDayMatch(s.day, start),
      );
      if (daySched) {
        isOpen = daySched.enabled;
        if (daySched.startTime) openTimeStr = daySched.startTime;
        if (daySched.endTime) closeTimeStr = daySched.endTime;
        if (daySched.maxBookings) maxConcurrent = daySched.maxBookings;
        else if (service.availability.maxBookingsPerSlot)
          maxConcurrent = service.availability.maxBookingsPerSlot;
      }
    }

    if (!isOpen)
      return {
        isAvailable: false,
        priceMultiplier: 1,
        reason: 'Business is closed on this day.',
      };

    if (!is24h && openTimeStr && closeTimeStr) {
      const formatTime = (date: Date) => {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:00`;
      };
      const requestedStart = formatTime(start);
      const requestedEnd = formatTime(end);

      if (requestedStart < openTimeStr || requestedEnd > closeTimeStr) {
        return {
          isAvailable: false,
          priceMultiplier: 1,
          reason: 'Requested time is outside business hours.',
        };
      }
    }

    // Check Blocked Slots (Hard block, regardless of capacity)
    const blockedSlot = await this.blockedSlotRepository.findOne({
      where: {
        business: { id: service.business.id },
        startTime: LessThan(end),
        endTime: MoreThan(start),
      },
    });

    if (blockedSlot) {
      return {
        isAvailable: false,
        priceMultiplier: 1,
        reason: 'The business has manually blocked this time slot.',
      };
    }

    // Capacity Check: Find max concurrent bookings at any point during requested range
    // We check how many existing bookings overlap with the requested range
    const overlappingBookings = await this.bookingRepository.find({
      where: {
        service: { id: serviceId },
        startTime: LessThan(end),
        endTime: MoreThan(start),
        status: In([
          BookingStatus.PENDING,
          BookingStatus.APPROVED,
          BookingStatus.CONFIRMED,
        ]),
      },
    });

    if (overlappingBookings.length > 0) {
      // Logic: For every 1-minute interval in the requested range, check if count >= maxConcurrent
      // For efficiency, we only check the points where existing bookings start or end
      const points = new Set<number>();
      points.add(start.getTime());
      overlappingBookings.forEach((b) => {
        if (b.startTime > start && b.startTime < end)
          points.add(b.startTime.getTime());
      });

      for (const time of Array.from(points)) {
        const testTime = new Date(time);
        const concurrentAtThisPoint = overlappingBookings.filter(
          (b) => testTime >= b.startTime && testTime < b.endTime,
        ).length;

        if (concurrentAtThisPoint >= maxConcurrent) {
          return {
            isAvailable: false,
            priceMultiplier: 1,
            reason: `Service reached capacity (${maxConcurrent} max) during this range.`,
          };
        }
      }
    }

    const priceModifier = await this.priceModifierRepository.findOne({
      where: {
        business: { id: service.business.id },
        startTime: LessThan(end),
        endTime: MoreThan(start),
      },
    });

    return {
      isAvailable: true,
      priceMultiplier: priceModifier ? priceModifier.priceMultiplier : 1,
    };
  }

  async getAvailableTimeSlots(
    serviceId: string,
    dateStr: string,
  ): Promise<string[]> {
    const service = await this.serviceRepository.findOne({
      where: {
        id: serviceId,
        isActive: true,
        status: 'published',
        approvalStatus: ApprovalStatus.APPROVED,
        adminDisabled: false,
      },
      relations: ['business', 'business.user', 'business.businessHours'],
    });

    if (
      !service ||
      service.business.status !== BusinessStatus.PUBLISHED ||
      !service.business.user?.isActive
    ) {
      return []; // Return empty slots if service or business is invalid
    }

    // Parse date properly to avoid timezone shifts
    const [year, month, day] = dateStr.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    let openTimeStr = '';
    let closeTimeStr = '';
    let is24h = false;

    // 1. Try to get from Business Hours relation
    const businessHour = service.business.businessHours?.find((bh) =>
      this.isDayMatch(bh.dayOfWeek, targetDate),
    );

    if (businessHour) {
      openTimeStr = businessHour.openTime;
      closeTimeStr = businessHour.closeTime;
      is24h = businessHour.is24h;
    }
    // 2. Fallback to Service level availability JSON if it exists
    else if (service.availability?.schedule) {
      const sched = service.availability.schedule.find((s: any) =>
        this.isDayMatch(s.day, targetDate),
      );
      if (sched && sched.enabled) {
        openTimeStr = sched.startTime;
        closeTimeStr = sched.endTime;
      }
    }

    // If still no hours found, return empty
    if (!openTimeStr && !is24h) {
      return [];
    }

    const durationMinutes = service.duration || 60;
    const availableSlots: string[] = [];

    // Parse open/close times
    let openTimeMinutes = 0;
    let closeTimeMinutes = 24 * 60;

    if (!is24h) {
      const parseTimeStr = (tStr: string) => {
        if (!tStr) return 0;
        const [h, m] = tStr.split(':').map(Number);
        return h * 60 + m;
      };
      openTimeMinutes = parseTimeStr(openTimeStr);
      closeTimeMinutes = parseTimeStr(closeTimeStr);
    }

    // Get blocked slots and existing bookings for the day
    const blockedSlots = await this.blockedSlotRepository.find({
      where: {
        business: { id: service.business.id },
        startTime: LessThan(endOfDay),
        endTime: MoreThan(startOfDay),
      },
    });

    const existingBookings = await this.bookingRepository.find({
      where: {
        service: { id: serviceId },
        startTime: LessThan(endOfDay),
        endTime: MoreThan(startOfDay),
        status: In([
          BookingStatus.PENDING,
          BookingStatus.APPROVED,
          BookingStatus.CONFIRMED,
        ]),
      },
    });

    // Generate slots
    for (
      let m = openTimeMinutes;
      m + durationMinutes <= closeTimeMinutes;
      m += durationMinutes
    ) {
      const slotStart = new Date(startOfDay);
      slotStart.setHours(Math.floor(m / 60), m % 60, 0, 0);

      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

      // Check for overlap
      const isBlocked = blockedSlots.some(
        (bs) => slotStart < bs.endTime && slotEnd > bs.startTime,
      );
      const isBooked = existingBookings.some(
        (eb) => slotStart < eb.endTime && slotEnd > eb.startTime,
      );

      if (!isBlocked && !isBooked) {
        availableSlots.push(
          `${slotStart.getHours().toString().padStart(2, '0')}:${slotStart.getMinutes().toString().padStart(2, '0')}`,
        );
      }
    }

    return availableSlots;
  }

  /**
   * Creates a new booking without charging the customer.
   *
   * The booking is created in PENDING status and must be paid for through
   * `initiatePayment` (create the payment intent) followed by `verifyPayment`
   * (confirm funds were captured) before it can transition to CONFIRMED.
   * No synthetic `ServicePayment` record is written here.
   */
  async create(
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<ServiceBooking> {
    const booking = await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        return this._createBooking(
          createBookingDto,
          userId,
          transactionalEntityManager,
          { skipNotifications: true },
        );
      },
    );

    // Send notifications AFTER successful transaction commit
    this.sendBookingNotifications(booking.id).catch((err) => {
      this.logger.error(
        `Failed to send post-commit booking notifications: ${err.message}`,
      );
    });

    return booking;
  }

  /**
   * Creates a booking within an existing transaction, without creating a separate payment.
   * This is intended to be used when a booking is part of a larger order.
   */
  async createBookingForOrder(
    createBookingDto: CreateBookingDto,
    userId: string,
    transactionalEntityManager: EntityManager,
    options?: { skipNotifications?: boolean },
  ): Promise<ServiceBooking> {
    return this._createBooking(
      createBookingDto,
      userId,
      transactionalEntityManager,
      options,
    );
  }

  async sendBookingNotifications(bookingId: string): Promise<void> {
    const fullBooking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: [
        'user',
        'service',
        'service.business',
        'service.business.user',
      ],
    });
    if (!fullBooking) return;

    try {
      await this.emailService.sendBookingNotification(fullBooking, false);
      await this.emailService.sendBookingNotification(fullBooking, true);
    } catch (error) {
      this.logger.error('Failed to send booking notification emails:', error);
    }

    if (fullBooking.service?.business?.user?.id) {
      await this.notificationService.create({
        recipientId: fullBooking.service.business.user.id,
        type: NotificationType.NEW_BOOKING,
        entityId: fullBooking.id,
      });
    }
  }

  private async _createBooking(
    createBookingDto: CreateBookingDto,
    userId: string,
    transactionalEntityManager: EntityManager,
    options?: { skipNotifications?: boolean },
  ): Promise<ServiceBooking> {
    const { serviceId, startTime, endTime, numberOfGuests, addonIds } =
      createBookingDto;

    const service = await transactionalEntityManager.findOne(Service, {
      where: {
        id: serviceId,
        isActive: true,
        status: 'published',
        approvalStatus: ApprovalStatus.APPROVED,
        adminDisabled: false,
      },
      relations: [
        'business',
        'business.user',
        'business.businessHours',
        'configurableAddons',
      ],
    });
    if (!service) throw new NotFoundException('Active service not found.');

    const business = service.business;
    if (!business)
      throw new NotFoundException('Business not found for this service.');

    if (business.status !== BusinessStatus.PUBLISHED) {
      throw new BadRequestException(
        `Business "${business.businessName}" is not currently active and cannot accept bookings.`,
      );
    }
    if (!business.user || !business.user.isActive) {
      throw new BadRequestException(
        `The owner of business "${business.businessName}" is not currently active and cannot accept bookings.`,
      );
    }

    if (!business.listingType.includes(ListingType.SERVICE)) {
      throw new ForbiddenException(
        'Bookings are not available for this business.',
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Serialize concurrent bookings for the same service+slot. Without this,
    // two READ COMMITTED transactions can both pass the overlap check and
    // double-book. The advisory lock is held until the surrounding
    // transaction commits or rolls back.
    await transactionalEntityManager.query(
      'SELECT pg_advisory_xact_lock(hashtext($1)::bigint)',
      [`booking:${serviceId}:${start.toISOString()}`],
    );

    // Check Availability using existing method logic
    const availability = await this.checkAvailability({
      serviceId,
      startTime,
      endTime,
    });
    if (!availability.isAvailable) {
      throw new ConflictException(
        'The selected time slot is not available or outside business hours.',
      );
    }

    // Concurrency protection: verify no overlapping active booking exists in DB transaction
    const overlappingBooking = await transactionalEntityManager.findOne(
      ServiceBooking,
      {
        where: {
          service: { id: serviceId },
          startTime: LessThan(end),
          endTime: MoreThan(start),
          status: In([
            BookingStatus.CONFIRMED,
            BookingStatus.APPROVED,
            BookingStatus.PENDING,
          ]),
        },
      },
    );
    if (overlappingBooking) {
      throw new ConflictException(
        'The selected time slot has just been booked by another customer.',
      );
    }

    // Process Addons
    const selectedAddons = [];
    if (addonIds && addonIds.length > 0) {
      for (const addonId of addonIds) {
        const addon = service.configurableAddons.find((a) => a.id === addonId);
        if (addon) {
          selectedAddons.push({
            id: addon.id,
            name: addon.name,
            price: Number(addon.price),
          });
        }
      }
    }

    const booking = transactionalEntityManager.create(ServiceBooking, {
      user: { id: userId },
      service: { id: serviceId },
      startTime: start,
      endTime: end,
      numberOfGuests: numberOfGuests || 1,
      variantId: createBookingDto.variantId,
      tierId: createBookingDto.tierId,
      quantity: createBookingDto.quantity || 1,
      numberOfStaff: createBookingDto.numberOfStaff || 1,
      addonDetails: selectedAddons.length > 0 ? selectedAddons : null,
      address: createBookingDto.address,
      phone: createBookingDto.phone,
      problemDescription: createBookingDto.problemDescription,
      photos: createBookingDto.photos,
      config: createBookingDto.config,
    });

    const savedBooking = await transactionalEntityManager.save(booking);

    if (!options?.skipNotifications) {
      // Fetch full booking details for email
      const fullBooking = await transactionalEntityManager.findOne(
        ServiceBooking,
        {
          where: { id: savedBooking.id },
          relations: [
            'user',
            'service',
            'service.business',
            'service.business.user',
          ],
        },
      );

      if (fullBooking) {
        // Send emails to both customer and business owner
        try {
          await this.emailService.sendBookingNotification(fullBooking, false); // Customer
          await this.emailService.sendBookingNotification(fullBooking, true); // Business Owner
        } catch (error) {
          console.error('Failed to send booking notification emails:', error);
        }
      }

      await this.notificationService.create({
        recipientId: business.user.id,
        type: NotificationType.NEW_BOOKING,
        entityId: savedBooking.id,
      });
    }

    return savedBooking;
  }

  async findAllForBusiness(
    userId: string,
    days?: number,
  ): Promise<ServiceBooking[]> {
    const businesses = await this.businessRepository.find({
      where: { user: { id: userId } },
      relations: ['services'],
    });
    const serviceIds = businesses.flatMap((business) =>
      business.services.map((service) => service.id),
    );

    if (serviceIds.length === 0) {
      return [];
    }

    const where: any = { service: { id: In(serviceIds) } };

    if (days) {
      const date = new Date();
      date.setDate(date.getDate() - days);
      where.startTime = MoreThan(date);
    }

    return this.bookingRepository.find({
      where,
      relations: ['user', 'service', 'payment'],
      order: { created_at: 'DESC' },
    });
  }

  async findAllForCustomer(
    userId: string,
    days?: number,
  ): Promise<ServiceBooking[]> {
    const where: any = { user: { id: userId } };

    if (days) {
      const date = new Date();
      date.setDate(date.getDate() - days);
      where.startTime = MoreThan(date);
    }

    return this.bookingRepository.find({
      where,
      relations: ['user', 'service', 'payment', 'service.business'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Declines a booking.
   * This method is wrapped in a transaction for consistency.
   */
  async decline(bookingId: string, userId: string): Promise<ServiceBooking> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const booking = await transactionalEntityManager.findOne(ServiceBooking, {
        where: { id: bookingId },
        relations: ['service', 'service.business', 'service.business.user'],
      });

      if (!booking) {
        throw new NotFoundException('Booking not found.');
      }

      if (booking.service.business.user.id !== userId) {
        throw new ForbiddenException(
          'You are not authorized to decline this booking.',
        );
      }

      booking.status = BookingStatus.DECLINED;
      return transactionalEntityManager.save(booking);
    });
  }

  /**
   * Approves a booking.
   * This method is wrapped in a transaction for consistency.
   */
  async approve(bookingId: string, userId: string): Promise<ServiceBooking> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const booking = await transactionalEntityManager.findOne(ServiceBooking, {
        where: { id: bookingId },
        relations: ['service', 'service.business', 'service.business.user'],
      });

      if (!booking) {
        throw new NotFoundException('Booking not found.');
      }

      if (booking.service.business.user.id !== userId) {
        throw new ForbiddenException(
          'You are not authorized to approve this booking.',
        );
      }

      booking.status = BookingStatus.APPROVED;
      return transactionalEntityManager.save(booking);
    });
  }

  /**
   * Cancels a booking.
   * This method is wrapped in a transaction for consistency.
   */
  async cancel(bookingId: string, userId: string): Promise<ServiceBooking> {
    const cancelled = await this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(ServiceBooking, {
        where: { id: bookingId },
        relations: ['user', 'payment'],
      });

      if (!booking) {
        throw new NotFoundException('Booking not found.');
      }

      if (booking.user.id !== userId) {
        throw new ForbiddenException(
          'You are not authorized to cancel this booking.',
        );
      }

      const wasPaid = !!booking.payment || !!booking.paymentIntentId;
      const canRefund =
        wasPaid && !booking.refundProcessed && !booking.payoutProcessed;

      booking.status = BookingStatus.CANCELLED;

      if (canRefund && booking.paymentIntentId) {
        try {
          const transactionRepo = manager.getRepository(BookingTransaction);
          let refundResult;

          const method = booking.payment?.paymentMethod;
          if (method === PaymentMethod.MCOM_WALLET) {
            await this.paymentProviderService.releaseWalletHold(
              booking.paymentIntentId,
              'Booking cancelled',
            );
          } else if (method) {
            refundResult = await this.paymentOrchestrator.refund({
              rail: method,
              reference: booking.paymentIntentId,
              reason: 'MCOM Mall booking refund',
            });
            booking.refundId = refundResult.id;
          }

          if (refundResult) {
            booking.refundProcessed = true;
            booking.status = BookingStatus.REFUNDED;

            const refundTx = transactionRepo.create({
              booking,
              type: TransactionType.REFUND,
              amount: booking.totalAmount,
              referenceId: booking.refundId,
              status: TransactionStatus.COMPLETED,
            });
            await transactionRepo.save(refundTx);
            await this.reverseLocalRefundEarnings(booking.id, manager);
          }
        } catch (error) {
          console.error(
            `Automatic refund failed for booking ${bookingId}:`,
            error,
          );
          // We still cancel the booking even if refund fails (admin can force it later)
        }
      }

      return manager.save(booking);
    });

    // A cancelled booking can never be paid, so any reward held for it must be
    // freed immediately instead of waiting for the stale-reservation sweep.
    // The helper only touches RESERVED rows and is idempotent.
    try {
      await this.releasePendingBookingRewards(bookingId, 'booking_cancelled');
    } catch (err: any) {
      this.logger.warn(
        `[booking] failed to release reward after cancelling ${bookingId}: ${err?.message ?? err}`,
      );
    }

    return cancelled;
  }

  async blockSlot(
    blockSlotDto: BlockSlotDto,
    userId: string,
  ): Promise<BlockedSlot> {
    const { businessId, startTime, endTime, isAllDay } = blockSlotDto;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isAllDay) {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });

    if (!business) {
      throw new NotFoundException('Business not found.');
    }

    if (business.user.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to block slots for this business.',
      );
    }

    const blockedSlot = this.blockedSlotRepository.create({
      business,
      startTime: start,
      endTime: end,
      isAllDay,
    });

    return this.blockedSlotRepository.save(blockedSlot);
  }

  async setPriceModifier(
    priceModifierDto: PriceModifierDto,
    userId: string,
  ): Promise<PriceModifier> {
    const { businessId, startTime, endTime, priceMultiplier, isAllDay } =
      priceModifierDto;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isAllDay) {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });

    if (!business) {
      throw new NotFoundException('Business not found.');
    }

    if (business.user.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to set price modifiers for this business.',
      );
    }

    const priceModifier = this.priceModifierRepository.create({
      business,
      startTime: start,
      endTime: end,
      priceMultiplier,
      isAllDay,
    });

    return this.priceModifierRepository.save(priceModifier);
  }

  private toMoney(value: number): number {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  /**
   * Price a service that is being booked as part of a product checkout.
   *
   * Uses the exact same authoritative calculation as a standalone booking so a
   * bundled service can never be silently under-charged or drift from the
   * amount shown to the shopper.
   */
  quoteForService(
    service: Service,
    startTime: Date | string,
    endTime: Date | string,
    options?: {
      tierId?: string;
      variantId?: string;
      quantity?: number;
      numberOfGuests?: number;
      addonIds?: string[];
    },
  ): {
    totalAmount: number;
    commissionAmount: number;
    providerAmount: number;
  } {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      throw new BadRequestException(
        'A valid start time and a later end time are required for a service booking.',
      );
    }

    const addonDetails =
      options?.addonIds && options.addonIds.length > 0
        ? options.addonIds
            .map((id) =>
              service.configurableAddons?.find((addon) => addon.id === id),
            )
            .filter((addon): addon is NonNullable<typeof addon> =>
              Boolean(addon),
            )
            .map((addon) => ({
              id: addon.id,
              name: addon.name,
              price: Number(addon.price),
            }))
        : null;

    const draft = {
      service,
      startTime: start,
      endTime: end,
      tierId: options?.tierId,
      variantId: options?.variantId,
      quantity: options?.quantity ?? 1,
      numberOfGuests: options?.numberOfGuests ?? 1,
      addonDetails,
    } as unknown as ServiceBooking;

    return this.calculateBookingPricing(draft);
  }

  /**
   * Authoritative booking price from the service configuration. Used by both
   * payment initiation and reward eligibility so both agree on the base.
   */
  private calculateBookingPricing(booking: ServiceBooking): {
    totalAmount: number;
    commissionAmount: number;
    providerAmount: number;
  } {
    const service = booking.service;
    let baseAmount = 0;
    const pricingModel = service.pricingModel;

    if (booking.tierId && service.tiers) {
      const tier = service.tiers.find((t: any) => t.id === booking.tierId);
      if (tier) baseAmount = Number(tier.price || 0);
    } else if (booking.variantId && service.variants) {
      const variant = service.variants.find(
        (v: any) => v.id === booking.variantId,
      );
      if (variant) baseAmount = Number(variant.price || 0);
    }

    if (baseAmount === 0) {
      if (pricingModel === 'fixed') {
        baseAmount = Number(service.fixedPrice || 0);
      } else if (pricingModel === 'perHour') {
        baseAmount = Number(service.pricePerHour || 0);
      } else if (pricingModel === 'perUnit') {
        baseAmount = Number(service.pricePerUnit || 0);
      }
    }

    let units = 1;
    if (pricingModel === 'perHour') {
      const durationHours =
        (booking.endTime.getTime() - booking.startTime.getTime()) /
        (1000 * 60 * 60);
      units = Math.max(1, durationHours);
    } else if (pricingModel === 'perUnit') {
      units = booking.quantity || 1;
    }

    const calculatedBase = baseAmount * units;

    let multiplier = 1;
    let surcharge = 0;
    const pricingRules = service.pricingRules;
    if (pricingRules) {
      const bookingDate = new Date(booking.startTime);
      const isWeekend =
        bookingDate.getDay() === 0 || bookingDate.getDay() === 6;
      if (isWeekend && pricingRules.weekendMultiplier) {
        multiplier = pricingRules.weekendMultiplier;
      }
      const startHour = bookingDate.getHours();
      if ((startHour >= 18 || startHour < 7) && pricingRules.nightSurcharge) {
        surcharge += Number(pricingRules.nightSurcharge);
      }
    }

    let guestAmount = 0;
    if (service.enableGuestPricing && service.guestPricingModel) {
      const guests = booking.numberOfGuests || 1;
      if (service.guestPricingModel === 'perGuest') {
        guestAmount = Number(service.pricePerGuest || 0) * guests;
      } else if (service.guestPricingModel === 'baseWithAdditional') {
        const extraGuests = Math.max(0, guests - (service.baseGuests || 0));
        guestAmount =
          extraGuests * Number(service.additionalGuestPrice || 0);
      }
    }

    let addonsAmount = 0;
    if (booking.addonDetails && Array.isArray(booking.addonDetails)) {
      addonsAmount = booking.addonDetails.reduce(
        (sum, addon) => sum + Number(addon.price || 0),
        0,
      );
    }

    const bookingFee = Number(service.bookingFee || 0);
    const travelFee =
      (service.deliveryConfig?.mode === 'onsite'
        ? service.deliveryConfig?.travelFee
        : 0) || 0;

    const totalAmount = this.toMoney(
      calculatedBase * multiplier +
        guestAmount +
        addonsAmount +
        surcharge +
        bookingFee +
        Number(travelFee),
    );

    if (totalAmount <= 0) {
      throw new BadRequestException(
        'Total booking amount must be greater than zero.',
      );
    }

    const commissionRate = 0.1;
    const commissionAmount = this.toMoney(totalAmount * commissionRate);
    const providerAmount = this.toMoney(totalAmount - commissionAmount);
    return { totalAmount, commissionAmount, providerAmount };
  }

  /**
   * Payee splits for a booking's cash charge: the provider's share and the
   * Mall's commission. When the buyer used instruments/discounts, the cash is
   * apportioned proportionally and the provider keeps the remainder in the
   * local escrow/earnings ledger.
   */
  private buildBookingSettlement(
    booking: ServiceBooking,
    cashAmount: number,
  ): {
    splits?: McomPaySplit[];
    providerCashMinor: bigint;
    providerOwnerId?: string;
  } {
    const providerOwner = booking.service?.business?.user;
    const providerAmount = Number(booking.providerAmount || 0);
    const commissionAmount = Number(booking.commissionAmount || 0);
    if (providerAmount <= 0 && commissionAmount <= 0) {
      return { providerCashMinor: 0n, providerOwnerId: providerOwner?.id };
    }

    const providerKey = `provider:${providerOwner?.id ?? 'unknown'}`;
    const platformKey =
      process.env.MCOM_PLATFORM_PAYEE_ID || 'mcom-mall-platform';
    const payees: WeightedSplit[] = [];

    if (providerAmount > 0) {
      payees.push({
        key: providerKey,
        entitlementMinor: BigInt(Math.round(providerAmount * 100)),
        split: providerOwner?.centralUserId
          ? {
              payeeType: 'mcom_user',
              payeeUserId: providerOwner.centralUserId,
            }
          : {
              payeeType: 'external',
              payeeExternalId: `business:${booking.service.business.id}`,
            },
      });
    }
    if (commissionAmount > 0) {
      payees.push({
        key: platformKey,
        entitlementMinor: BigInt(Math.round(commissionAmount * 100)),
        split: { payeeType: 'external', payeeExternalId: platformKey },
      });
    }

    const allocation = this.paymentProviderService.isSplitsEnabled()
      ? allocateCashSplits(
          BigInt(Math.round(cashAmount * 100)),
          payees,
          platformKey,
        )
      : undefined;

    return {
      splits: allocation?.splits?.length ? allocation.splits : undefined,
      providerCashMinor: allocation?.allocatedMinor.get(providerKey) ?? 0n,
      providerOwnerId: providerOwner?.id,
    };
  }

  /**
   * The provider's local (un-split) earnings for a booking. MCOM Pay reverses
   * the split portion itself on refund, so only this remainder is reversed in
   * the Mall's wallet ledger.
   */
  private async localProviderEarningsForRefund(
    bookingId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const repo = manager
      ? manager.getRepository(ServiceBooking)
      : this.bookingRepository;
    const booking = await repo.findOne({
      where: { id: bookingId },
      relations: [
        'service',
        'service.business',
        'service.business.user',
        'payment',
      ],
    });
    if (!booking?.payment) return 0;

    const providerAmount = Number(booking.providerAmount || 0);
    if (providerAmount <= 0) return 0;
    if (!booking.payment.mcomChargeId) return providerAmount;

    const local = await this.paymentProviderService.getLocalChargeMeta(
      booking.payment.mcomChargeId,
    );
    const splits = local.splits.length
      ? local.splits
      : local.intent === 'BOOKING'
        ? this.buildBookingSettlement(
            booking,
            Number(booking.payment.amount || 0),
          ).splits ?? []
        : [];
    const cash = this.bookingProviderCashMinor(splits, booking);
    return Math.max(0, providerAmount - Number(cash) / 100);
  }

  private async reverseLocalRefundEarnings(
    bookingId: string,
    manager: EntityManager,
  ): Promise<void> {
    const localAmount = await this.localProviderEarningsForRefund(
      bookingId,
      manager,
    );
    if (localAmount > 0) {
      await this.walletService.reverseBookingEarnings(
        bookingId,
        localAmount,
        manager,
      );
    }
  }

  private bookingProviderCashMinor(
    splits: McomPaySplit[],
    booking: ServiceBooking,
  ): bigint {
    if (!splits?.length) return 0n;
    const providerOwner = booking.service?.business?.user;
    const expectedUser = providerOwner?.centralUserId;
    const expectedExternal = `business:${booking.service.business?.id}`;
    return splits.reduce((total, split) => {
      const matches = expectedUser
        ? split.payeeUserId === expectedUser
        : split.payeeExternalId === expectedExternal;
      return matches ? total + BigInt(split.amountMinor || '0') : total;
    }, 0n);
  }

  /** Rewards a shopper can apply to a specific booking. */
  async getEligibleBookingRewards(bookingId: string, userId: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, user: { id: userId } },
      relations: ['service', 'service.business', 'service.business.user'],
    });
    if (!booking) throw new NotFoundException('Booking not found.');

    const pricing = this.calculateBookingPricing(booking);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'centralUserId'],
    });

    let rewards: any[] = [];
    let degraded = false;
    if (this.rewardsClient.isEnabled() && user?.centralUserId) {
      const result = await this.rewardsClient.tryListUserIssuances(
        user.centralUserId,
        { status: 'ISSUED', limit: 100 },
      );
      if (result) {
        const line: EligibilityLine = {
          lineKey: `service:${booking.service.id}`,
          kind: 'SERVICE',
          id: booking.service.id,
          businessId: booking.service.business?.id,
          businessMcomUserId:
            booking.service.business?.user?.centralUserId ?? undefined,
          unitPrice: pricing.totalAmount,
          quantity: 1,
        };
        rewards = this.rewardsEligibility.evaluate(result.data, [line]);
      } else {
        degraded = true;
      }
    }

    return {
      meshEnabled: this.rewardsClient.isEnabled(),
      degraded,
      totalAmount: pricing.totalAmount,
      rewardDiscountApplied: Number(booking.rewardDiscountApplied || 0),
      rewards,
    };
  }

  /**
   * Reserve a reward for this booking (or release a previous reservation when
   * the caller switches/removes the reward). Returns the discount amount.
   */
  private async applyBookingReward(
    booking: ServiceBooking,
    userId: string,
    totalAmount: number,
    issuanceId?: string,
  ): Promise<number> {
    if (!issuanceId) {
      await this.releasePendingBookingRewards(
        booking.id,
        'booking_payment_reinitiated',
      );
      return 0;
    }

    if (!this.rewardsClient.isEnabled()) {
      throw new BadRequestException(
        'Reward redemption is not available right now. Please try again later.',
      );
    }

    const committed = await this.bookingRewardRepository.findOne({
      where: {
        bookingId: booking.id,
        status: BookingRewardStatus.COMMITTED,
      },
    });
    if (committed) {
      throw new BadRequestException(
        'A reward has already been applied to this booking.',
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

    const line: EligibilityLine = {
      lineKey: `service:${booking.service.id}`,
      kind: 'SERVICE',
      id: booking.service.id,
      businessId: booking.service.business?.id,
      businessMcomUserId:
        booking.service.business?.user?.centralUserId ?? undefined,
      unitPrice: totalAmount,
      quantity: 1,
    };
    const eligible = this.rewardsEligibility.evaluate(issuances, [line]);
    const reward = eligible.find((r) => r.issuanceId === issuanceId);
    const match = reward?.applicableLines.find(
      (l) => l.lineKey === line.lineKey,
    );
    if (!match) {
      throw new BadRequestException(
        'The selected reward does not apply to this booking.',
      );
    }

    const discount = this.toMoney(Math.min(match.discountAmount, totalAmount));

    // Reuse an existing reservation for the same issuance (e.g. switching
    // Stripe ↔ PayPal) instead of releasing and re-reserving it.
    const existingReservation = await this.bookingRewardRepository.findOne({
      where: {
        bookingId: booking.id,
        rewardIssuanceId: issuanceId,
        status: BookingRewardStatus.RESERVED,
      },
    });
    if (
      existingReservation &&
      this.toMoney(Number(existingReservation.discountAmount)) === discount
    ) {
      return discount;
    }

    // Switching rewards/amounts: release the previous reservation first.
    await this.releasePendingBookingRewards(
      booking.id,
      'booking_reward_changed',
    );

    const reservationRef = `booking:${booking.id}:${randomUUID()}`;
    try {
      await this.rewardsClient.reserveIssuance(issuanceId, {
        orderRef: reservationRef,
        idempotencyKey: `${reservationRef}:${issuanceId}`,
        metadata: { bookingId: booking.id, discountAmount: discount },
      });
    } catch (err: any) {
      throw new BadRequestException(
        `Could not reserve reward: ${err?.message || err}`,
      );
    }

    const issuance = issuances.find((i) => i.id === issuanceId);
    const row = this.bookingRewardRepository.create({
      booking: { id: booking.id } as ServiceBooking,
      bookingId: booking.id,
      rewardIssuanceId: issuanceId,
      issuerClientId: issuance?.issuerClientId,
      rewardType: issuance?.rewardType ?? undefined,
      discountAmount: discount,
      status: BookingRewardStatus.RESERVED,
      reservationRef,
      metadata: { code: issuance?.code ?? null },
    });
    await this.bookingRewardRepository.save(row);
    return discount;
  }

  private async releasePendingBookingRewards(
    bookingId: string,
    reason: string,
  ): Promise<void> {
    const rows = await this.bookingRewardRepository.find({
      where: { bookingId, status: BookingRewardStatus.RESERVED },
    });
    for (const row of rows) {
      try {
        if (this.rewardsClient.isEnabled()) {
          await this.rewardsClient.releaseIssuance(row.rewardIssuanceId, {
            orderRef: row.reservationRef || `booking:${bookingId}`,
            reason,
          });
        }
        row.status = BookingRewardStatus.RELEASED;
        row.releasedAt = new Date();
        await this.bookingRewardRepository.save(row);
      } catch (err: any) {
        this.logger.warn(
          `[booking] failed to release reward ${row.rewardIssuanceId}: ${err?.message || err}`,
        );
        await this.enqueueBookingRewardOutbox(
          RewardOutboxOperation.RELEASE,
          row,
          String(err?.message || err),
        );
      }
    }
  }

  private async commitBookingReward(booking: ServiceBooking): Promise<void> {
    const row = await this.bookingRewardRepository.findOne({
      where: { bookingId: booking.id, status: BookingRewardStatus.RESERVED },
    });
    if (!row) return;

    try {
      await this.rewardsClient.commitIssuance(row.rewardIssuanceId, {
        orderRef: row.reservationRef || `booking:${booking.id}`,
      });
      row.status = BookingRewardStatus.COMMITTED;
      row.committedAt = new Date();
      await this.bookingRewardRepository.save(row);
    } catch (err: any) {
      this.logger.error(
        `[booking] reward commit failed for ${row.rewardIssuanceId} — queued`,
        err,
      );
      await this.enqueueBookingRewardOutbox(
        RewardOutboxOperation.COMMIT,
        row,
        String(err?.message || err),
      );
    }
  }

  private async enqueueBookingRewardOutbox(
    operation: RewardOutboxOperation,
    row: BookingReward,
    failureReason: string,
  ): Promise<void> {
    try {
      const idempotencyKey = `${operation}:booking:${row.bookingId}:${row.rewardIssuanceId}`;
      const existing = await this.rewardOutboxRepository.findOne({
        where: { idempotencyKey },
      });
      if (existing) return;
      await this.rewardOutboxRepository.save(
        this.rewardOutboxRepository.create({
          rewardIssuanceId: row.rewardIssuanceId,
          orderId: `booking:${row.bookingId}`,
          reservationRef: row.reservationRef,
          operation,
          idempotencyKey,
          failureReason: failureReason?.slice(0, 2000),
          status: RewardOutboxStatus.PENDING,
          metadata: { bookingId: row.bookingId },
        }),
      );
    } catch (err) {
      this.logger.error(
        `[booking] failed to persist reward outbox for ${row.rewardIssuanceId}`,
        err,
      );
    }
  }

  async initiatePayment(
    initiateDto: InitiateBookingPaymentDto,
    userId: string,
  ): Promise<{
    clientSecret?: string;
    orderId?: string;
    approvalUrl?: string | null;
    transactionId?: string;
    holdId?: string;
    expiresAt?: string;
    provider: PaymentMethod;
    amount: number;
    rewardDiscount?: number;
    totalAmount?: number;
  }> {
    const { bookingId, paymentProvider } = initiateDto;

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, user: { id: userId } },
      relations: [
        'user',
        'service',
        'service.business',
        'service.business.user',
      ],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    if (
      booking.service.approvalStatus !== ApprovalStatus.APPROVED ||
      booking.service.status !== 'published' ||
      !booking.service.isActive ||
      booking.service.adminDisabled
    ) {
      throw new BadRequestException(
        'This service is currently unavailable. Payment cannot be initiated.',
      );
    }

    const business = booking.service.business;
    if (business.status !== BusinessStatus.PUBLISHED) {
      throw new BadRequestException(
        `Business "${business.businessName}" is not active. Payment cannot be initiated.`,
      );
    }
    if (!business.user || !business.user.isActive) {
      throw new BadRequestException(
        `The owner of business "${business.businessName}" is not active. Payment cannot be initiated.`,
      );
    }

    const pricing = this.calculateBookingPricing(booking);
    const totalAmount = pricing.totalAmount;

    // --- MCOM Rewards discount for this booking ---
    const rewardDiscount = await this.applyBookingReward(
      booking,
      userId,
      totalAmount,
      initiateDto.rewardIssuanceId,
    );

    // ── Scoped coupons / gift cards / vouchers ────────────────────────────
    const scopeLine: ScopeLine = {
      lineKey: `service:${booking.service.id}`,
      kind: 'service',
      id: booking.service.id,
      businessId:
        (booking.service as any).businessId ?? booking.service.business?.id ?? null,
      unitPrice: totalAmount,
      quantity: 1,
      lineTotal: totalAmount,
      discount: rewardDiscount,
    };

    let couponDiscount = 0;
    if (initiateDto.couponCode) {
      const coupon = await this.couponService.validateCoupon(
        initiateDto.couponCode,
        booking.user,
      );
      const couponScope = await this.instrumentScopeService.getEffectiveScope(
        InstrumentType.COUPON,
        { id: coupon.id, businessId: coupon.business?.id ?? null },
      );
      const isScoped =
        !!couponScope && couponScope.scopeMode !== ScopeMode.NO_SCOPE;
      if (isScoped && !this.instrumentScopeService.matches(couponScope, scopeLine)) {
        throw new UnprocessableEntityException(
          'SCOPE_NO_ELIGIBLE_LINES: this coupon does not apply to this booking.',
        );
      }
      const base = Math.max(0, round2(totalAmount - rewardDiscount));
      couponDiscount = computeCouponDiscount({
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        base,
        maxDiscount: Number((coupon as any).maxDiscount),
      });
      couponDiscount = round2(Math.max(0, couponDiscount));
    }

    let priceReducerAmount = 0;
    if (initiateDto.priceReducerCode) {
      const priceReducer = await this.moneyEngineService.getOwnedByCode(
        initiateDto.priceReducerCode,
        booking.user,
      );
      const scope = this.moneyEngineService.getScopeForDefinition(
        priceReducer.definition,
      );
      const isScoped = !!scope && scope.mode !== ScopeMode.NO_SCOPE;
      if (
        isScoped &&
        !this.instrumentScopeService.matches(scope, scopeLine)
      ) {
        throw new UnprocessableEntityException(
          'SCOPE_NO_ELIGIBLE_LINES: this Voucher Coupon does not apply to this booking.',
        );
      }
      const resolved = await this.moneyEngineService.resolvePriceReducer(
        initiateDto.priceReducerCode,
        booking.user,
        Math.max(0, totalAmount - rewardDiscount - couponDiscount),
      );
      priceReducerAmount = resolved.amount;
    }

    const afterCoupon = round2(
      totalAmount - rewardDiscount - couponDiscount - priceReducerAmount,
    );
    let giftCardAmount = 0;
    if (initiateDto.giftCardCode) {
      const card = await this.giftCardService.findActiveCardByCode(
        initiateDto.giftCardCode,
      );
      await this.giftCardService.assertCanRedeem(card, {
        businessId: business.id,
        userId: booking.user?.id ?? null,
      });
      const bindingBusinessId =
        await this.giftCardService.getBusinessBinding(card);
      const scope = await this.instrumentScopeService.getEffectiveScope(
        InstrumentType.GIFT_CARD,
        { id: card.id, businessId: bindingBusinessId },
      );
      const isScoped = !!scope && scope.scopeMode !== ScopeMode.NO_SCOPE;
      if (isScoped && !this.instrumentScopeService.matches(scope, scopeLine)) {
        throw new UnprocessableEntityException(
          'SCOPE_NO_ELIGIBLE_LINES: this gift card does not apply to this booking.',
        );
      }
      const balance = Number(card.currentBalance);
      giftCardAmount = computeInstrumentApplication({
        requested: initiateDto.giftCardAmount,
        balance,
        eligiblePayable: afterCoupon,
        remainingPayable: afterCoupon,
      });
    }

    const afterGiftCard = round2(afterCoupon - giftCardAmount);
    let voucherAmount = 0;
    if (initiateDto.voucherCode) {
      const voucher = await this.voucherService.findVoucherByCode(
        initiateDto.voucherCode,
      );
      if (
        voucher.status === VoucherStatus.REDEEMED ||
        voucher.status === VoucherStatus.DISABLED ||
        (voucher.expiresAt && new Date() > voucher.expiresAt)
      ) {
        throw new BadRequestException('Voucher is invalid or expired.');
      }
      const voucherOwnerId =
        (voucher.owner as any)?.id ||
        (voucher.buyer as any)?.id ||
        (voucher as any).ownerId ||
        (voucher as any).buyerId;
      if (voucherOwnerId && voucherOwnerId !== booking.user?.id) {
        throw new ForbiddenException(
          'This voucher cannot be redeemed for this booking.',
        );
      }
      if (
        voucher.voucherProduct &&
        !voucher.voucherProduct.allowPartialRedemption &&
        Number(voucher.balance) < afterGiftCard
      ) {
        throw new BadRequestException(
          'This voucher does not allow partial redemption.',
        );
      }
      const scope = await this.instrumentScopeService.getEffectiveScope(
        InstrumentType.VOUCHER,
        {
          id: voucher.id,
          businessId:
            voucher.businessId ?? (voucher as any).business?.id ?? null,
        },
      );
      const isScoped = !!scope && scope.scopeMode !== ScopeMode.NO_SCOPE;
      if (isScoped && !this.instrumentScopeService.matches(scope, scopeLine)) {
        throw new UnprocessableEntityException(
          'SCOPE_NO_ELIGIBLE_LINES: this voucher does not apply to this booking.',
        );
      }
      const balance = Number(voucher.balance);
      voucherAmount = computeInstrumentApplication({
        requested: initiateDto.voucherAmount,
        balance,
        eligiblePayable: afterGiftCard,
        remainingPayable: afterGiftCard,
      });
    }

    const afterVoucher = round2(afterGiftCard - voucherAmount);
    let moneyVoucherAmount = 0;
    if (initiateDto.moneyVoucherCode) {
      if (!this.featureFlags.isMoneyVoucherCheckoutEnabled()) {
        throw new BadRequestException(
          'Money vouchers are not enabled at checkout.',
        );
      }

      const moneyVoucher = await this.moneyEngineService.getOwnedByCode(
        initiateDto.moneyVoucherCode,
        booking.user,
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
      if (
        isScoped &&
        !this.instrumentScopeService.matches(scope, scopeLine)
      ) {
        throw new UnprocessableEntityException(
          'SCOPE_NO_ELIGIBLE_LINES: this voucher does not apply to this booking.',
        );
      }

      const balance = round2(
        Number(moneyVoucher.realBalance) +
          Number(moneyVoucher.rewardBalance),
      );
      moneyVoucherAmount = computeInstrumentApplication({
        requested: initiateDto.moneyVoucherAmount,
        balance,
        eligiblePayable: afterVoucher,
        remainingPayable: afterVoucher,
      });
    }

    const payableAmount = round2(
      totalAmount -
        rewardDiscount -
        couponDiscount -
        priceReducerAmount -
        giftCardAmount -
        voucherAmount -
        moneyVoucherAmount,
    );
    if (payableAmount < 0) {
      throw new BadRequestException('Payable amount cannot be negative.');
    }
    if (payableAmount <= 0) {
      throw new BadRequestException(
        'This reward covers the full booking value. Full-value reward redemptions are not supported in the payment flow yet.',
      );
    }

    booking.totalAmount = totalAmount;
    booking.commissionAmount = pricing.commissionAmount;
    booking.providerAmount = pricing.providerAmount;
    booking.rewardDiscountApplied = rewardDiscount;
    booking.couponDiscountApplied = couponDiscount;
    booking.couponCode = initiateDto.couponCode ?? null;
    booking.priceReducerAmountApplied = priceReducerAmount;
    booking.priceReducerCode =
      priceReducerAmount > 0 ? (initiateDto.priceReducerCode ?? null) : null;
    booking.giftCardAmountApplied = giftCardAmount;
    booking.giftCardCode = initiateDto.giftCardCode ?? null;
    booking.voucherAmountApplied = voucherAmount;
    booking.voucherCode = initiateDto.voucherCode ?? null;
    booking.moneyVoucherAmountApplied = moneyVoucherAmount;
    booking.moneyVoucherCode = initiateDto.moneyVoucherCode ?? null;
    const currency = 'GBP';
    const bookingSettlement = this.buildBookingSettlement(
      booking,
      payableAmount,
    );

    if (paymentProvider === PaymentMethod.MCOM_WALLET) {
      const centralUserId = booking.user?.centralUserId;
      if (!centralUserId) {
        throw new BadRequestException(
          'MCOM Wallet is not linked for this account. Please re-authenticate via SSO.',
        );
      }

      // A previous wallet charge may already have settled for this booking
      // (double click / amount unchanged). Reuse it; if the payable amount
      // changed, refund the old charge before charging the new total.
      if (
        booking.paymentIntentId &&
        !booking.paymentIntentId.startsWith('pi_')
      ) {
        const existing = await this.paymentOrchestrator.checkWalletCharge(
          booking.paymentIntentId,
          payableAmount,
          currency,
          { mallUserId: userId, centralUserId },
        );
        if (existing.ok) {
          return {
            transactionId: booking.paymentIntentId,
            provider: PaymentMethod.MCOM_WALLET,
            amount: payableAmount,
            rewardDiscount,
            totalAmount,
          };
        }
        // An unconfirmed attempt is a hold, not a charge: release it rather
        // than refunding, then place a fresh hold for the current total.
        try {
          await this.paymentProviderService.releaseWalletHold(
            booking.paymentIntentId,
            'Superseded by a new booking payment attempt',
          );
        } catch (releaseErr) {
          this.logger.warn(
            `Could not release superseded wallet hold ${booking.paymentIntentId}: ${releaseErr instanceof Error ? releaseErr.message : releaseErr}`,
          );
        }
      }

      const initiated = await this.paymentOrchestrator.initiate({
        rail: PaymentMethod.MCOM_WALLET,
        amount: payableAmount,
        currency,
        payer: { mallUserId: userId, centralUserId },
        reference: `booking-${booking.id}`,
        idempotencyKey: this.paymentProviderService.buildWalletKey(
          'booking-hold',
          booking.id,
          payableAmount.toFixed(2),
          Date.now(),
        ),
        walletHoldMetadata: {
          purpose: 'BOOKING',
          bookingId: booking.id,
          userId,
          intent: 'BOOKING' as McomPayIntent,
        },
        intent: 'BOOKING' as McomPayIntent,
        walletMode: 'hold',
      });
      if (initiated.rail !== 'mcom_wallet') {
        throw new BadRequestException('Invalid payment rail for wallet.');
      }
      booking.paymentIntentId = initiated.holdId;
      await this.bookingRepository.save(booking);

      return {
        transactionId: initiated.holdId,
        holdId: initiated.holdId,
        expiresAt: initiated.expiresAt,
        provider: PaymentMethod.MCOM_WALLET,
        amount: payableAmount,
        rewardDiscount,
        totalAmount,
      };
    }

    if (paymentProvider === PaymentMethod.STRIPE) {
      // Check if we already have a valid intent for this booking
      if (
        booking.paymentIntentId &&
        booking.paymentIntentId.startsWith('pi_')
      ) {
        try {
          const existingIntent =
            await this.paymentOrchestrator.checkStripePayment(
              booking.paymentIntentId,
              payableAmount,
              currency,
              {
                mallUserId: userId,
                centralUserId: booking.user?.centralUserId,
              },
            );
          // If the existing intent is already settled we cannot re-supply a
          // client secret. Fall through to the idempotent create below, which
          // replays the same MCOM Pay charge and returns its client secret.
          if (
            existingIntent.ok &&
            (existingIntent.details as any)?.client_secret
          ) {
            return {
              clientSecret: (existingIntent.details as any).client_secret,
              provider: PaymentMethod.STRIPE,
              amount: payableAmount,
            };
          }
        } catch (_e) {
          // If retrieval fails or amount mismatch, we'll just create a new one below
        }
      }

      const initiated = await this.paymentOrchestrator.initiate({
        rail: PaymentMethod.STRIPE,
        amount: payableAmount,
        currency,
        payer: {
          mallUserId: userId,
          centralUserId: booking.user?.centralUserId,
        },
        metadata: { bookingId: booking.id },
        reference: `booking-${booking.id}`,
        idempotencyKey: `booking-payment-${booking.id}-${payableAmount.toFixed(2)}`,
        intent: 'BOOKING' as McomPayIntent,
        splits: bookingSettlement.splits,
      });
      if (initiated.rail !== 'stripe') {
        throw new BadRequestException('Invalid payment rail for card.');
      }
      // `chargeId` is the MCOM Pay charge id; persist the provider handle (the
      // Stripe PaymentIntent id) so verify-payment can compare like-for-like.
      booking.paymentIntentId =
        initiated.providerRef ?? initiated.chargeId;
      await this.bookingRepository.save(booking);

      return {
        clientSecret: initiated.clientSecret,
        provider: PaymentMethod.STRIPE,
        amount: payableAmount,
        rewardDiscount,
        totalAmount,
      };
    } else if (paymentProvider === PaymentMethod.PAYPAL) {
      // For PayPal, we usually create a new order unless we want to track capture state
      const initiated = await this.paymentOrchestrator.initiate({
        rail: PaymentMethod.PAYPAL,
        amount: payableAmount,
        currency,
        payer: {
          mallUserId: userId,
          centralUserId: booking.user?.centralUserId,
        },
        metadata: { bookingId: booking.id },
        reference: `booking-${booking.id}`,
        idempotencyKey: `booking-payment-${booking.id}-${payableAmount.toFixed(2)}`,
        intent: 'BOOKING' as McomPayIntent,
        splits: bookingSettlement.splits,
      });
      if (initiated.rail !== 'paypal') {
        throw new BadRequestException('Invalid payment rail for PayPal.');
      }
      booking.paymentIntentId = initiated.orderId;
      await this.bookingRepository.save(booking);

      return {
        orderId: initiated.orderId,
        approvalUrl: initiated.approvalUrl,
        provider: PaymentMethod.PAYPAL,
        amount: payableAmount,
        rewardDiscount,
        totalAmount,
      };
    } else {
      throw new BadRequestException('Invalid payment provider specified.');
    }
  }

  async verifyPayment(
    verifyDto: VerifyBookingPaymentDto,
    userId: string,
  ): Promise<ServiceBooking> {
    const { bookingId, amount, paymentProvider, transactionId } = verifyDto;
    const currency = 'GBP';

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, user: { id: userId } },
      relations: [
        'user',
        'service',
        'service.business',
        'service.business.user',
      ],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    if (
      booking.service.approvalStatus !== ApprovalStatus.APPROVED ||
      booking.service.status !== 'published' ||
      !booking.service.isActive ||
      booking.service.adminDisabled
    ) {
      throw new BadRequestException(
        'This service is currently unavailable. Payment cannot be verified.',
      );
    }

    const business = booking.service.business;
    if (business.status !== BusinessStatus.PUBLISHED) {
      throw new BadRequestException(
        `Business "${business.businessName}" is no longer active. Payment cannot be verified.`,
      );
    }
    if (!business.user || !business.user.isActive) {
      throw new BadRequestException(
        `The owner of business "${business.businessName}" is no longer active. Payment cannot be verified.`,
      );
    }

    // Server-side amount check: the client must pay the post-reward total.
    // Price-reducer and money-voucher deductions are part of payableAmount and
    // must be subtracted here too, otherwise those bookings can never verify.
    const expectedAmount = this.toMoney(
      Number(booking.totalAmount || 0) -
        Number(booking.rewardDiscountApplied || 0) -
        Number(booking.couponDiscountApplied || 0) -
        Number(booking.giftCardAmountApplied || 0) -
        Number(booking.voucherAmountApplied || 0) -
        Number(booking.priceReducerAmountApplied || 0) -
        Number(booking.moneyVoucherAmountApplied || 0),
    );
    if (expectedAmount > 0 && Math.abs(Number(amount) - expectedAmount) > 0.01) {
      throw new BadRequestException(
        `The payment amount (${amount}) does not match the expected total (${expectedAmount}).`,
      );
    }
    const bookingSettlement = this.buildBookingSettlement(
      booking,
      expectedAmount,
    );

    if (
      booking.paymentIntentId &&
      transactionId &&
      booking.paymentIntentId !== transactionId
    ) {
      // Legacy rows stored the MCOM Pay charge id in `paymentIntentId`, while
      // the browser sends the Stripe PaymentIntent / PayPal order handle. Allow
      // that mapping once, then normalise the row to the provider handle.
      let matchedLegacyCharge = false;
      if (paymentProvider === PaymentMethod.STRIPE) {
        try {
          const charge = await this.paymentOrchestrator.getCharge(
            booking.paymentIntentId,
          );
          matchedLegacyCharge = charge.providerRef === transactionId;
        } catch {
          matchedLegacyCharge = false;
        }
      }
      if (matchedLegacyCharge) {
        booking.paymentIntentId = transactionId;
        await this.bookingRepository.save(booking);
      } else {
        throw new BadRequestException(
          'This payment reference does not belong to this booking.',
        );
      }
    }

    const verification = await this.paymentOrchestrator.confirm({
      rail: paymentProvider,
      reference: transactionId,
      amount: expectedAmount,
      currency,
      payer: {
        mallUserId: userId,
        centralUserId: booking.user?.centralUserId,
      },
      holdId:
        paymentProvider === PaymentMethod.MCOM_WALLET
          ? transactionId
          : undefined,
      contextReference: `booking-${booking.id}`,
      intent: 'BOOKING' as McomPayIntent,
      splits: bookingSettlement.splits,
      // Include the hold reference: a hold is unique per attempt, so a retry
      // of the same hold replays the same charge, while a failed attempt (or a
      // superseded hold) gets a fresh key instead of being stuck on Central's
      // "idempotency key already used for a failed charge" error.
      idempotencyKey: this.paymentProviderService.buildWalletKey(
        'booking-capture',
        booking.id,
        transactionId,
      ),
    });

    if (!verification.ok) {
      throw new BadRequestException(
        `Payment verification failed: ${verification.reason}`,
      );
    }

    const paidChargeId = verification.chargeId;
    const paidProviderRef = verification.providerRef;
    const paidFeeMinor = verification.feeMinor;
    const paidNetMinor = verification.netMinor;
    const paymentReference = verification.transactionId || transactionId;

    const localCharge = paidChargeId
      ? await this.paymentProviderService.getLocalChargeMeta(paidChargeId)
      : { splits: [], intent: null };
    // Webhook-created rows have the intent label but not the splits (Central
    // does not return metadata). Recompute the deterministic booking splits so
    // the local earnings credit is not doubled.
    const appliedSplits = localCharge.splits.length
      ? localCharge.splits
      : localCharge.intent === 'BOOKING'
        ? bookingSettlement.splits ?? []
        : [];
    const providerCashMinor = this.bookingProviderCashMinor(
      appliedSplits,
      booking,
    );

    // Idempotent replay: the same charge already confirmed this booking.
    const existingServicePayment = await this.servicePaymentRepository.findOne({
      where: [
        { transactionId: paymentReference },
        ...(paidChargeId ? [{ mcomChargeId: paidChargeId }] : []),
      ],
    });
    if (existingServicePayment) {
      const existingBooking = await this.bookingRepository.findOne({
        where: { payment: { id: existingServicePayment.id } },
      });
      if (existingBooking) return existingBooking;
    }

    try {
      const confirmedBooking = await this.dataSource.transaction(async (manager) => {
        const paymentRepo = manager.getRepository(ServicePayment);
        const transactionRepo = manager.getRepository(BookingTransaction);

        // Serialize concurrent confirmations of the same booking. The browser
        // calls verify-payment while MCOM Pay also delivers payment.succeeded;
        // without this lock both can pass the idempotency check and one then
        // violates the unique mcomChargeId constraint, which would trigger a
        // spurious compensating refund for a legitimate payment.
        await manager.findOne(ServiceBooking, {
          where: { id: booking.id },
          lock: { mode: 'pessimistic_write' },
        });

        const reused = await paymentRepo.findOne({
          where: [
            { transactionId: paymentReference },
            ...(paidChargeId ? [{ mcomChargeId: paidChargeId }] : []),
          ],
        });
        if (reused) {
          const alreadyPaidBooking = await manager.findOne(ServiceBooking, {
            where: { payment: { id: reused.id } },
            relations: [
              'user',
              'service',
              'service.business',
              'service.business.user',
              'payment',
            ],
          });
          if (alreadyPaidBooking) return alreadyPaidBooking;
          throw new BadRequestException(
            'This payment has already been used for another booking.',
          );
        }

        const newPayment = paymentRepo.create({
          user: { id: userId },
          amount,
          currency,
          transactionId: paymentReference,
          paymentMethod: paymentProvider,
          mcomChargeId: paidChargeId,
          providerRef: paidProviderRef,
          feeMinor: paidFeeMinor,
          netMinor: paidNetMinor,
          status: 'paid',
        });
        const savedPayment = await paymentRepo.save(newPayment);

        await this.paymentProviderService.allocateCharge(
          {
            mcomChargeId: paidChargeId || `wallet:${paymentReference}`,
            purpose: 'BOOKING',
            entityType: 'booking',
            entityId: booking.id,
            userId,
            amountMinor: String(Math.round(Number(amount) * 100)),
            currency: 'GBP',
          },
          manager,
        );

        const newTransaction = transactionRepo.create({
          booking,
          type: TransactionType.PAYMENT,
          amount,
          referenceId: transactionId,
          status: TransactionStatus.COMPLETED,
        });
        await transactionRepo.save(newTransaction);

        booking.payment = savedPayment;
        booking.status = BookingStatus.CONFIRMED; // Mark booking as CONFIRMED upon successful payment

        // Consume any scoped instruments bound to this booking. Failures
        // propagate so the compensating refund path runs.
        if (booking.couponCode && Number(booking.couponDiscountApplied) > 0) {
          await this.couponService.redeem(booking.couponCode, booking.user);
        }
        if (booking.giftCardCode && Number(booking.giftCardAmountApplied) > 0) {
          await this.giftCardService.consumeForBooking(
            {
              code: booking.giftCardCode,
              amount: Number(booking.giftCardAmountApplied),
              userId: booking.user.id,
              businessId: booking.service.business.id,
              bookingId: booking.id,
            },
            manager,
          );
        }
        if (booking.voucherCode && Number(booking.voucherAmountApplied) > 0) {
          await this.voucherService.consumeForBooking(
            {
              code: booking.voucherCode,
              amount: Number(booking.voucherAmountApplied),
              userId: booking.user.id,
              businessId: booking.service.business.id,
              bookingId: booking.id,
            },
            manager,
          );
        }
        if (
          booking.priceReducerCode &&
          Number(booking.priceReducerAmountApplied) > 0
        ) {
          await this.moneyEngineService.redeemPriceReducer(
            {
              code: booking.priceReducerCode,
              amount: Number(booking.priceReducerAmountApplied),
              userId: booking.user.id,
              businessId: booking.service.business.id,
              referenceId: booking.id,
              source: 'booking',
            },
            manager,
          );
        }

        if (
          booking.moneyVoucherCode &&
          Number(booking.moneyVoucherAmountApplied) > 0
        ) {
          const redemption = await this.moneyEngineService.redeemForBooking(
            {
              code: booking.moneyVoucherCode,
              amount: Number(booking.moneyVoucherAmountApplied),
              userId: booking.user.id,
              businessId: booking.service.business.id,
              bookingId: booking.id,
            },
            manager,
          );
          booking.moneyVoucherRealAmountApplied = round2(
            redemption.realDeduction,
          );
          booking.moneyVoucherRewardAmountApplied = round2(
            redemption.rewardDeduction,
          );
        }

        // Ensure amounts are synced to the booking entity if they weren't set during initiation
        if (!booking.totalAmount || booking.totalAmount === 0) {
          booking.totalAmount = amount;
          const commissionRate = 0.1; // 10% commission
          booking.commissionAmount = parseFloat(
            (amount * commissionRate).toFixed(2),
          );
          booking.providerAmount = parseFloat(
            (amount - booking.commissionAmount).toFixed(2),
          );
        }

        await manager.save(booking);

        // Fetch full booking details for email update
        const fullBooking = await manager.findOne(ServiceBooking, {
          where: { id: booking.id },
          relations: [
            'user',
            'service',
            'service.business',
            'service.business.user',
            'payment',
          ],
        });

        if (fullBooking) {
          // Send updated emails to both customer and business owner
          try {
            await this.emailService.sendBookingNotification(fullBooking, false); // Customer
            await this.emailService.sendBookingNotification(fullBooking, true); // Business Owner
          } catch (error) {
            console.error('Failed to send booking verification emails:', error);
          }
        }

        // Subtract the part already paid to the provider through MCOM Pay
        // splits; the local ledger only carries the un-split remainder.
        const providerLocalAmount = this.toMoney(
          Math.max(
            0,
            Number(booking.providerAmount || 0) -
              Number(providerCashMinor) / 100,
          ),
        );
        if (providerLocalAmount > 0) {
          await this.walletService.creditEarning(
            {
              userId: booking.service.business.user.id,
              amount: providerLocalAmount, // Only credit provider amount for earnings info (though it's in escrow)
              type: WalletTransactionType.EARNING_BOOKING,
              description: `Pending payment in escrow for booking #${booking.id}`,
            },
            manager,
          );
        }

        // Process Cashback
        if (booking.user.email) {
          try {
            await this.centralIntegrationService.processCashback(
              booking.user.email,
              Number(amount),
              CashbackEvent.SERVICE_BOOKING_PAYMENT,
              transactionId,
            );
          } catch (error) {
            this.logger.error(
              `Failed to process cashback for booking ${transactionId}: ${error.message}`,
            );
          }
        }

        return booking;
      });

      await this.commitBookingReward(confirmedBooking);
      await this.enqueueBookingInstrumentCallbacks(confirmedBooking);
      return confirmedBooking;
    } catch (dbErr) {
      // Race fallback: if a concurrent confirmation (usually the webhook)
      // committed this same payment first, the insert fails on the unique
      // charge key. That is a successful replay, not a failed booking, so
      // return the paid booking instead of refunding it.
      const duplicateKey =
        (dbErr as any)?.code === '23505' ||
        (dbErr as any)?.driverError?.code === '23505';
      if (duplicateKey) {
        const existingPayment = await this.servicePaymentRepository.findOne({
          where: [
            { transactionId: paymentReference },
            ...(paidChargeId ? [{ mcomChargeId: paidChargeId }] : []),
          ],
        });
        if (existingPayment) {
          const existingBooking = await this.bookingRepository.findOne({
            where: { payment: { id: existingPayment.id } },
            relations: [
              'user',
              'service',
              'service.business',
              'service.business.user',
              'payment',
            ],
          });
          if (existingBooking && existingBooking.id === booking.id) {
            this.logger.warn(
              `Booking ${bookingId} was already confirmed by a concurrent payment event; returning the existing confirmation.`,
            );
            return existingBooking;
          }
        }
      }

      this.logger.error(
        `Database transaction failed for booking ${bookingId} after payment was verified/captured. Initiating compensating refund.`,
        dbErr,
      );
      await this.releasePendingBookingRewards(
        bookingId,
        'booking_payment_failed',
      );
      try {
        if (paymentProvider === PaymentMethod.MCOM_WALLET) {
          await this.paymentProviderService.releaseWalletHold(
            transactionId,
            'Booking payment failed',
          );
        } else {
          await this.paymentOrchestrator.refund({
            rail: paymentProvider,
            reference: transactionId,
            amount,
            reason: 'MCOM Mall booking payment failed',
          });
        }
      } catch (refundErr) {
        this.logger.error(
          `Compensating refund also failed for booking ${bookingId}, transaction ${transactionId}: ${refundErr.message}`,
        );
      }
      throw new InternalServerErrorException(
        'An error occurred while confirming your booking. If your account was charged, a refund has been initiated.',
      );
    }
  }

  /**
   * Webhook backstop: confirm a booking from a paid MCOM Pay charge when the
   * browser closed before `/bookings/verify-payment`.
   */
  async verifyPaymentFromWebhook(input: {
    bookingId: string;
    chargeId: string;
    amountMinor: string;
    method: string;
    providerRef?: string | null;
  }): Promise<ServiceBooking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: input.bookingId },
      relations: ['user'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    const paymentProvider =
      input.method === 'paypal'
        ? PaymentMethod.PAYPAL
        : input.method === 'wallet'
          ? PaymentMethod.MCOM_WALLET
          : PaymentMethod.STRIPE;
    const transactionId =
      paymentProvider === PaymentMethod.MCOM_WALLET
        ? input.chargeId
        : input.providerRef || input.chargeId;

    return this.verifyPayment(
      {
        bookingId: input.bookingId,
        amount: Number(input.amountMinor) / 100,
        paymentProvider,
        transactionId,
      },
      booking.user.id,
    );
  }

  async completeBooking(
    bookingId: string,
    userId: string,
  ): Promise<ServiceBooking> {
    const completedBooking = await this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(ServiceBooking, {
        where: { id: bookingId },
        relations: [
          'user',
          'service',
          'service.business',
          'service.business.user',
          'payment',
        ],
      });

      if (!booking) {
        throw new NotFoundException('Booking not found.');
      }

      const isBusinessOwner = booking.service.business.user.id === userId;
      const isCustomer = booking.user.id === userId;

      if (!isBusinessOwner && !isCustomer) {
        throw new ForbiddenException(
          'You are not authorized to complete this booking.',
        );
      }

      if (isBusinessOwner) {
        booking.businessOwnerCompleted = true;
      }

      if (isCustomer) {
        booking.customerCompleted = true;
      }

      if (booking.businessOwnerCompleted && booking.customerCompleted) {
        booking.status = BookingStatus.COMPLETED;

        // If MCOM Pay already split the cash to the provider, never run the
        // Mall's own Stripe/PayPal escrow payout for the same booking. The
        // un-split remainder is still released from the local pending bucket
        // by `releaseBookingPayment` below.
        const chargeSplits = booking.payment?.mcomChargeId
          ? await this.paymentProviderService.getLocalChargeSplits(
              booking.payment.mcomChargeId,
            )
          : [];
        const paidViaSplits = chargeSplits.length > 0;

        // --- Escrow Payout Logic (legacy / no payee splits) ---
        if (
          !paidViaSplits &&
          !booking.payoutProcessed &&
          !booking.refundProcessed
        ) {
          const transactionRepo = manager.getRepository(BookingTransaction);

          let transferResult: { id: string } | PaypalPayoutBatch | undefined;
          try {
            if (booking.payment?.paymentMethod === PaymentMethod.STRIPE) {
              const integrationSetting = await manager.findOne(
                IntegrationSetting,
                { where: { businessId: booking.service.business.id } },
              );
              const stripeAccountId =
                integrationSetting?.stripeConnected === true
                  ? integrationSetting.stripeAccountId
                  : undefined;

              if (!stripeAccountId) {
                this.logger.error(
                  `Escrow payout skipped for booking ${booking.id}: business ${booking.service.business.id} has no connected Stripe account.`,
                );
              } else {
                const transfer =
                  await this.paymentProviderService.createStripeTransfer(
                    booking.providerAmount,
                    'gbp',
                    stripeAccountId,
                    { bookingId: booking.id },
                  );
                booking.transferId = transfer.id;
                transferResult = transfer;
              }
            } else if (
              booking.payment?.paymentMethod === PaymentMethod.PAYPAL
            ) {
              const payout =
                await this.paymentProviderService.createPaypalPayout(
                  booking.providerAmount,
                  'gbp',
                  booking.service.business.user.email,
                );
              booking.transferId = payout.batch_header.payout_batch_id;
              transferResult = payout;
            }
          } catch (error: unknown) {
            this.logger.error(
              `Escrow payout failed for booking ${booking.id}:`,
              error instanceof Error ? error.stack : String(error),
            );
          }

          if (transferResult) {
            booking.payoutProcessed = true;

            const payoutTx = transactionRepo.create({
              booking,
              type: TransactionType.PAYOUT,
              amount: booking.providerAmount,
              referenceId: booking.transferId,
              status: TransactionStatus.COMPLETED,
            });
            await transactionRepo.save(payoutTx);

            const commissionTx = transactionRepo.create({
              booking,
              type: TransactionType.COMMISSION,
              amount: booking.commissionAmount,
              status: TransactionStatus.COMPLETED,
            });
            await transactionRepo.save(commissionTx);
          }
        }

        // Bundled service bookings do not have their own ServicePayment and
        // therefore no external transfer. Their pending provider earning was
        // credited by the parent order; release it once.
        if (!booking.payment) {
          if (!booking.payoutProcessed) {
            await this.walletService.releaseBookingPayment(booking.id);
            booking.payoutProcessed = true;
          }
        } else {
          await this.walletService.releaseBookingPayment(booking.id);
        }
      }

      return manager.save(booking);
    });

    if (completedBooking.status === BookingStatus.COMPLETED) {
      await this.loyaltyService
        .awardBookingPoints(completedBooking.id)
        .catch((err) =>
          this.logger.error(
            `Failed to award loyalty points for booking ${completedBooking.id}: ${err?.message || err}`,
          ),
        );
    }

    return completedBooking;
  }

  async getCompletedBookingsForOwner(
    userId: string,
  ): Promise<ServiceBooking[]> {
    const businesses = await this.businessRepository.find({
      where: { user: { id: userId } },
      relations: ['services'],
    });
    const serviceIds = businesses.flatMap((business) =>
      business.services.map((service) => service.id),
    );

    if (serviceIds.length === 0) {
      return [];
    }

    return this.bookingRepository.find({
      where: {
        service: { id: In(serviceIds) },
        status: BookingStatus.COMPLETED,
      },
      relations: ['payment'],
    });
  }

  async refundBooking(
    bookingId: string,
    requester: { id: string; role?: string } | string,
  ): Promise<ServiceBooking> {
    const requesterObj =
      typeof requester === 'string' ? { id: requester } : requester;
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(ServiceBooking, {
        where: { id: bookingId },
        relations: [
          'user',
          'payment',
          'service',
          'service.business',
          'service.business.user',
        ],
      });

      if (!booking) {
        throw new NotFoundException('Booking not found.');
      }

      const isAdmin = requesterObj.role === UserRole.ADMIN;
      const ownerId = (booking as any)?.service?.business?.user?.id;
      const isBusinessOwner =
        !!ownerId &&
        ownerId === requesterObj.id &&
        requesterObj.role === UserRole.OWNER;

      if (!isAdmin && !isBusinessOwner) {
        throw new ForbiddenException(
          'Only platform admins or the business owner can refund this booking.',
        );
      }

      if (
        booking.status !== BookingStatus.CONFIRMED &&
        booking.status !== BookingStatus.CANCELLED
      ) {
        throw new BadRequestException(
          'Only confirmed or cancelled bookings can be refunded.',
        );
      }

      if (booking.payoutProcessed) {
        throw new BadRequestException(
          'Cannot refund after payout has been processed.',
        );
      }

      if (booking.refundProcessed) {
        throw new BadRequestException('Refund already processed.');
      }

      if (!booking.paymentIntentId) {
        throw new BadRequestException('No payment intent found to refund.');
      }

      const transactionRepo = manager.getRepository(BookingTransaction);
      let refundResult;

      if (booking.payment?.paymentMethod === PaymentMethod.MCOM_WALLET) {
        await this.paymentProviderService.releaseWalletHold(
          booking.paymentIntentId,
          'Booking refunded',
        );
      } else if (booking.payment?.paymentMethod) {
        refundResult = await this.paymentOrchestrator.refund({
          rail: booking.payment.paymentMethod,
          reference: booking.paymentIntentId,
          reason: 'MCOM Mall booking refund',
        });
        booking.refundId = refundResult.id;
      }

      if (refundResult) {
        booking.refundProcessed = true;
        booking.status = BookingStatus.REFUNDED;

        const refundTx = transactionRepo.create({
          booking,
          type: TransactionType.REFUND,
          amount: booking.totalAmount,
          referenceId: booking.refundId,
          status: TransactionStatus.COMPLETED,
        });
        await transactionRepo.save(refundTx);
        await this.reverseLocalRefundEarnings(booking.id, manager);
      }

      return manager.save(booking);
    });
  }

  private async enqueueBookingInstrumentCallbacks(
    booking: ServiceBooking,
  ): Promise<void> {
    const jobs: Array<{
      issuanceId: string;
      code: string;
      instrumentType: InstrumentType;
      instrumentId: string;
      amount: number;
      note: string;
    }> = [];

    try {
      if (booking.couponCode && Number(booking.couponDiscountApplied) > 0) {
        const coupon = await this.couponService.findCouponByCode(
          booking.couponCode,
        );
        if (coupon.issuanceId) {
          jobs.push({
            issuanceId: coupon.issuanceId,
            code: coupon.code,
            instrumentType: InstrumentType.COUPON,
            instrumentId: coupon.id,
            amount: Number(booking.couponDiscountApplied),
            note: `booking:${booking.id}:coupon`,
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(
        `Could not resolve coupon callback for booking ${booking.id}: ${err?.message}`,
      );
    }

    try {
      if (booking.giftCardCode && Number(booking.giftCardAmountApplied) > 0) {
        const card = await this.giftCardService.findActiveCardByCode(
          booking.giftCardCode,
        );
        if (card.issuanceId) {
          jobs.push({
            issuanceId: card.issuanceId,
            code: card.code,
            instrumentType: InstrumentType.GIFT_CARD,
            instrumentId: card.id,
            amount: Number(booking.giftCardAmountApplied),
            note: `booking:${booking.id}:gift_card`,
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(
        `Could not resolve gift-card callback for booking ${booking.id}: ${err?.message}`,
      );
    }

    try {
      if (booking.voucherCode && Number(booking.voucherAmountApplied) > 0) {
        const voucher = await this.voucherService.findVoucherByCode(
          booking.voucherCode,
        );
        if (voucher.issuanceId) {
          jobs.push({
            issuanceId: voucher.issuanceId,
            code: voucher.code,
            instrumentType: InstrumentType.VOUCHER,
            instrumentId: voucher.id,
            amount: Number(booking.voucherAmountApplied),
            note: `booking:${booking.id}:voucher`,
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(
        `Could not resolve voucher callback for booking ${booking.id}: ${err?.message}`,
      );
    }

    for (const job of jobs) {
      try {
        await this.partnerCallbacks.enqueueRedeem(job);
      } catch (err: any) {
        this.logger.warn(
          `Failed to enqueue booking callback for issuance ${job.issuanceId}: ${err?.message}`,
        );
      }
    }
  }
}

function round2(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}
