import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, LessThan, MoreThan, Repository } from 'typeorm';

import { Business } from '../listings/entities/listing.entity';
import { ListingType } from '../listings/listing.enum';
import { NotificationType } from '../notification/notification.enum';
import { NotificationService } from '../notification/notification.service';
import { PaymentMethod } from '../order/entities/order-payment.entity';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { CashbackEvent } from '../../common/enums/cashback-event.enum';
import { Service } from '../services/entities/service.entity';
import {
  WalletTransactionType,
} from '../wallet/entities/wallet-transaction.entity';
import { WalletService } from '../wallet/wallet.service';
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
import { ServiceBookingRepository } from './service-booking.repository';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(BlockedSlot)
    private readonly blockedSlotRepository: Repository<BlockedSlot>,
    @InjectRepository(PriceModifier)
    private readonly priceModifierRepository: Repository<PriceModifier>,
    private readonly bookingRepository: ServiceBookingRepository,
    @InjectRepository(ServicePayment)
    private readonly servicePaymentRepository: Repository<ServicePayment>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly centralIntegrationService: CentralIntegrationService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
  ) {}

  async checkAvailability(
    checkAvailabilityDto: CheckAvailabilityDto,
  ): Promise<{ isAvailable: boolean; priceMultiplier: number }> {
    const { serviceId, startTime, endTime } = checkAvailabilityDto;

    const service = await this.serviceRepository.findOne({
      where: { id: serviceId },
      relations: ['business', 'business.user'],
    });

    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const blockedSlot = await this.blockedSlotRepository.findOne({
      where: {
        business: { id: service.business.id },
        startTime: LessThan(end),
        endTime: MoreThan(start),
      },
    });

    if (blockedSlot) {
      return { isAvailable: false, priceMultiplier: 1 };
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

  /**
   * Creates a new booking with a dedicated payment transaction.
   * This method is for standalone bookings.
   */
  async create(
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<ServiceBooking> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const booking = await this._createBooking(createBookingDto, userId, transactionalEntityManager);

      const service = await transactionalEntityManager.findOne(Service, {
        where: { id: createBookingDto.serviceId },
        relations: ['business'],
      });

      const priceModifier = await transactionalEntityManager.findOne(PriceModifier, {
        where: {
          business: { id: service.business.id },
          startTime: LessThan(new Date(createBookingDto.endTime)),
          endTime: MoreThan(new Date(createBookingDto.startTime)),
        },
      });
      const priceMultiplier = priceModifier ? priceModifier.priceMultiplier : 1;

      // TODO: Implement actual payment processing logic here.
      const payment = transactionalEntityManager.create(ServicePayment, {
        user: { id: userId },
        amount: 100 * priceMultiplier, // Placeholder amount
        currency: 'gbp',
        paymentMethod: PaymentMethod.STRIPE, // Placeholder payment method
        transactionId: 'temp_transaction_id', // Placeholder transaction id
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
    return this._createBooking(createBookingDto, userId, transactionalEntityManager);
  }

  private async _createBooking(
    createBookingDto: CreateBookingDto,
    userId: string,
    transactionalEntityManager: EntityManager,
  ): Promise<ServiceBooking> {
    const { serviceId, startTime, endTime } = createBookingDto;

    const service = await transactionalEntityManager.findOne(Service, {
      where: { id: serviceId },
      relations: ['business', 'business.user'],
    });
    if (!service) throw new NotFoundException('Service not found.');

    const business = service.business;
    if (!business) throw new NotFoundException('Business not found for this service.');

    if (!business.listingType.includes(ListingType.SERVICE)) {
      throw new ForbiddenException('Bookings are not available for this business.');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const blockedSlot = await transactionalEntityManager.findOne(BlockedSlot, {
      where: {
        business: { id: business.id },
        startTime: LessThan(end),
        endTime: MoreThan(start),
      },
    });
    if (blockedSlot) throw new ConflictException('The selected time slot is not available.');

    const booking = transactionalEntityManager.create(ServiceBooking, {
      user: { id: userId },
      service: { id: serviceId },
      startTime: start,
      endTime: end,
    });

    const savedBooking = await transactionalEntityManager.save(booking);

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
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const booking = await transactionalEntityManager.findOne(ServiceBooking, {
        where: { id: bookingId },
        relations: ['user'],
      });

      if (!booking) {
        throw new NotFoundException('Booking not found.');
      }

      if (booking.user.id !== userId) {
        throw new ForbiddenException(
          'You are not authorized to cancel this booking.',
        );
      }

      booking.status = BookingStatus.CANCELLED;
      return transactionalEntityManager.save(booking);
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
  ): Promise<{ clientSecret?: string; orderId?: string; provider: PaymentMethod }> {
    const { bookingId, paymentProvider } = initiateDto;

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, user: { id: userId } },
      relations: ['service'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    // This is a placeholder for the actual amount calculation
    const amount = booking.service.fixedPrice;
    const currency = 'GBP';

    if (paymentProvider === PaymentMethod.STRIPE) {
      const paymentIntent = await this.paymentProviderService.createStripePaymentIntent(
        amount,
        currency,
      );
      return {
        clientSecret: paymentIntent.client_secret,
        provider: PaymentMethod.STRIPE,
      };
    } else if (paymentProvider === PaymentMethod.PAYPAL) {
      const order = await this.paymentProviderService.createPaypalOrder(
        amount,
        currency,
      );
      return { orderId: order.id, provider: PaymentMethod.PAYPAL };
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
      relations: ['user', 'service', 'service.business', 'service.business.user'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

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
      const paymentRepo = manager.getRepository(ServicePayment);

      const newPayment = paymentRepo.create({
        user: { id: userId },
        amount,
        currency,
        transactionId,
        paymentMethod: paymentProvider,
      });
      const savedPayment = await paymentRepo.save(newPayment);

      booking.payment = savedPayment;
      await manager.save(booking);

      await this.walletService.creditEarning({
        userId: booking.service.business.user.id,
        amount,
        type: WalletTransactionType.EARNING_BOOKING,
        description: `Pending payment for booking #${booking.id}`,
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

  async completeBooking(bookingId: string, userId: string): Promise<ServiceBooking> {
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(ServiceBooking, {
        where: { id: bookingId },
        relations: ['user', 'service', 'service.business', 'service.business.user'],
      });

      if (!booking) {
        throw new NotFoundException('Booking not found.');
      }

      const isBusinessOwner = booking.service.business.user.id === userId;
      const isCustomer = booking.user.id === userId;

      if (!isBusinessOwner && !isCustomer) {
        throw new ForbiddenException('You are not authorized to complete this booking.');
      }

      if (isBusinessOwner) {
        booking.businessOwnerCompleted = true;
      }

      if (isCustomer) {
        booking.customerCompleted = true;
      }

      if (booking.businessOwnerCompleted && booking.customerCompleted) {
        booking.status = BookingStatus.COMPLETED;
        await this.walletService.releaseBookingPayment(booking.id);
      }

      return manager.save(booking);
    });
  }

  async getCompletedBookingsForOwner(userId: string): Promise<ServiceBooking[]> {
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
}
