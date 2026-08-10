import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
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
import { ListingType, BusinessStatus } from '../listings/listing.enum';
import { NotificationType } from '../notification/notification.enum';
import { NotificationService } from '../notification/notification.service';
import { PaymentMethod } from '../order/entities/order-payment.entity';
import {
  PaypalPayoutBatch,
  PaymentProviderService,
} from '../payments/services/payment-provider.service';
import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { CashbackEvent } from '../../common/enums/cashback-event.enum';
import { Service } from '../services/entities/service.entity';
import { WalletTransactionType } from '../wallet/entities/wallet-transaction.entity';
import { WalletService } from '../wallet/wallet.service';
import { EmailService } from '../email/email.service';
import { BlockSlotDto } from './dto/block-slot.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
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

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

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
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly centralIntegrationService: CentralIntegrationService,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
  ) {}

  async checkAvailability(checkAvailabilityDto: CheckAvailabilityDto): Promise<{
    isAvailable: boolean;
    priceMultiplier: number;
    reason?: string;
  }> {
    const { serviceId, startTime, endTime } = checkAvailabilityDto;

    const service = await this.serviceRepository.findOne({
      where: { id: serviceId, isActive: true },
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

    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    const dayOfWeekName = days[start.getDay()];

    // Get Capacity (max concurrent bookings) for this day
    let maxConcurrent = 1;
    let isOpen = false;
    let openTimeStr = '';
    let closeTimeStr = '';
    let is24h = false;

    // 1. Check from Business Hours
    const businessHour = service.business.businessHours?.find(
      (bh) => bh.dayOfWeek === (dayOfWeekName as any),
    );

    if (businessHour) {
      isOpen = true;
      openTimeStr = businessHour.openTime;
      closeTimeStr = businessHour.closeTime;
      is24h = businessHour.is24h;
    }

    // 2. Check Service Level Availability JSON (granular day settings)
    if (service.availability?.schedule) {
      const daySched = service.availability.schedule.find(
        (s: any) => s.day.toUpperCase() === dayOfWeekName,
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
      where: { id: serviceId, isActive: true },
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

    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    const dayOfWeekName = days[targetDate.getDay()];

    let openTimeStr = '';
    let closeTimeStr = '';
    let is24h = false;

    // 1. Try to get from Business Hours relation
    const businessHour = service.business.businessHours?.find(
      (bh) => bh.dayOfWeek === (dayOfWeekName as any),
    );

    if (businessHour && businessHour.dayOfWeek === (dayOfWeekName as any)) {
      openTimeStr = businessHour.openTime;
      closeTimeStr = businessHour.closeTime;
      is24h = businessHour.is24h;
    }
    // 2. Fallback to Service level availability JSON if it exists
    else if (service.availability?.schedule) {
      const sched = service.availability.schedule.find(
        (s: any) => s.day.toUpperCase() === dayOfWeekName,
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
   * Creates a new booking with a dedicated payment transaction.
   * This method is for standalone bookings.
   */
  async create(
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<ServiceBooking> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const booking = await this._createBooking(
        createBookingDto,
        userId,
        transactionalEntityManager,
      );

      const service = await transactionalEntityManager.findOne(Service, {
        where: { id: createBookingDto.serviceId },
        relations: ['business'],
      });

      const priceModifier = await transactionalEntityManager.findOne(
        PriceModifier,
        {
          where: {
            business: { id: service.business.id },
            startTime: LessThan(new Date(createBookingDto.endTime)),
            endTime: MoreThan(new Date(createBookingDto.startTime)),
          },
        },
      );
      const priceMultiplier = priceModifier ? priceModifier.priceMultiplier : 1;

      const basePrice = Number(
        service?.fixedPrice ||
          service?.basePrice ||
          service?.pricePerHour ||
          service?.pricePerUnit ||
          100,
      );
      const calculatedAmount = Number((basePrice * priceMultiplier).toFixed(2));
      const transactionId = `tx_bk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const payment = transactionalEntityManager.create(ServicePayment, {
        user: { id: userId },
        amount: calculatedAmount,
        currency: 'gbp',
        paymentMethod: PaymentMethod.STRIPE,
        transactionId,
      });
      await transactionalEntityManager.save(payment);

      booking.payment = payment;
      return transactionalEntityManager.save(booking);
    });
  }

  /**
   * Creates a booking within an existing transaction, without creating a separate payment.
   * This is intended to be used when a booking is part of a larger order.
   */
  async createBookingForOrder(
    createBookingDto: CreateBookingDto,
    userId: string,
    transactionalEntityManager: EntityManager,
  ): Promise<ServiceBooking> {
    return this._createBooking(
      createBookingDto,
      userId,
      transactionalEntityManager,
    );
  }

  private async _createBooking(
    createBookingDto: CreateBookingDto,
    userId: string,
    transactionalEntityManager: EntityManager,
  ): Promise<ServiceBooking> {
    const { serviceId, startTime, endTime, numberOfGuests, addonIds } =
      createBookingDto;

    const service = await transactionalEntityManager.findOne(Service, {
      where: { id: serviceId, isActive: true },
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
    return this.dataSource.transaction(async (manager) => {
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

          if (booking.payment?.paymentMethod === PaymentMethod.STRIPE) {
            refundResult =
              await this.paymentProviderService.refundStripePayment(
                booking.paymentIntentId,
              );
            booking.refundId = refundResult.id;
          } else if (booking.payment?.paymentMethod === PaymentMethod.PAYPAL) {
            refundResult = await this.paymentProviderService.refundPaypalOrder(
              booking.paymentIntentId,
            );
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

  async initiatePayment(
    initiateDto: InitiateBookingPaymentDto,
    userId: string,
  ): Promise<{
    clientSecret?: string;
    orderId?: string;
    provider: PaymentMethod;
    amount: number;
  }> {
    const { bookingId, paymentProvider } = initiateDto;

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, user: { id: userId } },
      relations: ['service', 'service.business', 'service.business.user'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
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

    // Calculate amounts based on actual service configuration
    let baseAmount = 0;
    const pricingModel = booking.service.pricingModel;

    // 1. Base Price Selection (Tier/Variant or Default)
    if (booking.tierId && booking.service.tiers) {
      const tier = booking.service.tiers.find(
        (t: any) => t.id === booking.tierId,
      );
      if (tier) baseAmount = Number(tier.price || 0);
    } else if (booking.variantId && booking.service.variants) {
      const variant = booking.service.variants.find(
        (v: any) => v.id === booking.variantId,
      );
      if (variant) baseAmount = Number(variant.price || 0);
    }

    if (baseAmount === 0) {
      if (pricingModel === 'fixed') {
        baseAmount = Number(booking.service.fixedPrice || 0);
      } else if (pricingModel === 'perHour') {
        baseAmount = Number(booking.service.pricePerHour || 0);
      } else if (pricingModel === 'perUnit') {
        baseAmount = Number(booking.service.pricePerUnit || 0);
      }
    }

    // 2. Duration/Quantity Multiplier
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

    // 3. Apply Pricing Rules (Weekend / Night)
    let multiplier = 1;
    let surcharge = 0;
    const pricingRules = booking.service.pricingRules;

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

    // 4. Guest Pricing
    let guestAmount = 0;
    if (
      booking.service.enableGuestPricing &&
      booking.service.guestPricingModel
    ) {
      const guests = booking.numberOfGuests || 1;
      if (booking.service.guestPricingModel === 'perGuest') {
        guestAmount = Number(booking.service.pricePerGuest || 0) * guests;
      } else if (booking.service.guestPricingModel === 'baseWithAdditional') {
        const extraGuests = Math.max(
          0,
          guests - (booking.service.baseGuests || 0),
        );
        guestAmount =
          extraGuests * Number(booking.service.additionalGuestPrice || 0);
      }
    }

    // 5. Addons Pricing
    let addonsAmount = 0;
    if (booking.addonDetails && Array.isArray(booking.addonDetails)) {
      addonsAmount = booking.addonDetails.reduce(
        (sum, addon) => sum + Number(addon.price || 0),
        0,
      );
    }

    const bookingFee = Number(booking.service.bookingFee || 0);
    const travelFee =
      (booking.service.deliveryConfig?.mode === 'onsite'
        ? booking.service.deliveryConfig?.travelFee
        : 0) || 0;

    const totalAmount =
      calculatedBase * multiplier +
      guestAmount +
      addonsAmount +
      surcharge +
      bookingFee +
      Number(travelFee);

    if (totalAmount <= 0) {
      throw new BadRequestException(
        'Total booking amount must be greater than zero.',
      );
    }

    const commissionRate = 0.1; // 10% commission
    const commissionAmount = parseFloat(
      (totalAmount * commissionRate).toFixed(2),
    );
    const providerAmount = parseFloat(
      (totalAmount - commissionAmount).toFixed(2),
    );
    const currency = 'GBP';

    booking.totalAmount = totalAmount;
    booking.commissionAmount = commissionAmount;
    booking.providerAmount = providerAmount;

    if (paymentProvider === PaymentMethod.STRIPE) {
      // Check if we already have a valid intent for this booking
      if (
        booking.paymentIntentId &&
        booking.paymentIntentId.startsWith('pi_')
      ) {
        try {
          const existingIntent =
            await this.paymentProviderService.verifyStripePaymentIntent(
              booking.paymentIntentId,
              totalAmount,
              currency,
            );
          // If it's already succeeded or still processing, we can return it (though succeeded should be handled by verify)
          if (
            existingIntent.ok ||
            existingIntent.reason?.includes('status succeeded')
          ) {
            return {
              clientSecret: (existingIntent.details as any).client_secret,
              provider: PaymentMethod.STRIPE,
              amount: totalAmount,
            };
          }
        } catch (_e) {
          // If retrieval fails or amount mismatch, we'll just create a new one below
        }
      }

      const paymentIntent =
        await this.paymentProviderService.createStripePaymentIntent(
          totalAmount,
          currency,
          { bookingId: booking.id },
        );
      booking.paymentIntentId = paymentIntent.id;
      await this.bookingRepository.save(booking);

      return {
        clientSecret: paymentIntent.client_secret,
        provider: PaymentMethod.STRIPE,
        amount: totalAmount,
      };
    } else if (paymentProvider === PaymentMethod.PAYPAL) {
      // For PayPal, we usually create a new order unless we want to track capture state
      const order = await this.paymentProviderService.createPaypalOrder(
        totalAmount,
        currency,
        { bookingId: booking.id },
      );
      booking.paymentIntentId = order.id;
      await this.bookingRepository.save(booking);

      return {
        orderId: order.id,
        provider: PaymentMethod.PAYPAL,
        amount: totalAmount,
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
    let verificationResult;

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
      const paymentRepo = manager.getRepository(ServicePayment);
      const transactionRepo = manager.getRepository(BookingTransaction);

      const newPayment = paymentRepo.create({
        user: { id: userId },
        amount,
        currency,
        transactionId,
        paymentMethod: paymentProvider,
      });
      const savedPayment = await paymentRepo.save(newPayment);

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

      await this.walletService.creditEarning({
        userId: booking.service.business.user.id,
        amount: booking.providerAmount, // Only credit provider amount for earnings info (though it's in escrow)
        type: WalletTransactionType.EARNING_BOOKING,
        description: `Pending payment in escrow for booking #${booking.id}`,
      });

      // Process Cashback
      if (booking.user.email) {
        await this.centralIntegrationService.processCashback(
          booking.user.email,
          Number(amount),
          CashbackEvent.SERVICE_BOOKING_PAYMENT,
          transactionId,
        );
      }

      return booking;
    });
  }

  async completeBooking(
    bookingId: string,
    userId: string,
  ): Promise<ServiceBooking> {
    return this.dataSource.transaction(async (manager) => {
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

        // --- Escrow Payout Logic ---
        if (!booking.payoutProcessed && !booking.refundProcessed) {
          const transactionRepo = manager.getRepository(BookingTransaction);

          let transferResult: { id: string } | PaypalPayoutBatch | undefined;
          try {
            if (booking.payment?.paymentMethod === PaymentMethod.STRIPE) {
              // Assuming business user has a stripeAccountId property, defaulting to mock for now
              const stripeAccountId = 'mock_acct_id';
              const transfer =
                await this.paymentProviderService.createStripeTransfer(
                  booking.providerAmount,
                  'gbp',
                  stripeAccountId,
                  { bookingId: booking.id },
                );
              booking.transferId = transfer.id;
              transferResult = transfer;
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

        await this.walletService.releaseBookingPayment(booking.id);
      }

      return manager.save(booking);
    });
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
    _adminId: string, // assuming refund is initiated by admin
  ): Promise<ServiceBooking> {
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(ServiceBooking, {
        where: { id: bookingId },
        relations: ['user', 'payment'],
      });

      if (!booking) {
        throw new NotFoundException('Booking not found.');
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

      if (booking.payment?.paymentMethod === PaymentMethod.STRIPE) {
        refundResult = await this.paymentProviderService.refundStripePayment(
          booking.paymentIntentId,
        );
        booking.refundId = refundResult.id;
      } else if (booking.payment?.paymentMethod === PaymentMethod.PAYPAL) {
        refundResult = await this.paymentProviderService.refundPaypalOrder(
          booking.paymentIntentId,
        );
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
      }

      return manager.save(booking);
    });
  }
}
