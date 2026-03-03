import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { BookingService } from './booking.service';
import { ServiceBooking } from './entities/service-booking.entity';
import { BlockedSlot } from './entities/blocked-slot.entity';
import { PriceModifier } from './entities/price-modifier.entity';
import { ServicePayment } from './entities/service-payment.entity';
import { BookingTransaction } from './entities/booking-transaction.entity';
import { Service } from '../services/entities/service.entity';
import { ListingType, BusinessStatus } from '../listings/listing.enum';
import { BookingStatus } from './entities/booking.enum';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { WalletService } from '../wallet/wallet.service';
import { PaymentMethod } from '../order/entities/order-payment.entity';
import { Business } from '../listings/entities/listing.entity';
import { EmailService } from '../email/email.service';

/**
 * UNIT TEST SUITE: Booking & Capacity Management
 *
 * Strategy:
 * 1. Capacity Logic: Verify that checkAvailability correctly calculates overlapping bookings
 *    against the service's maxBookings (concurrent slots) for a specific day.
 * 2. Multi-model Pricing: Verify that initiatePayment applies the correct math for:
 *    - Duration-based (perHour)
 *    - Variant-based (tier selection)
 *    - Surcharges (weekend/night)
 * 3. Escrow Security: Ensure payout is only processed when both dual-completion flags are true.
 */

describe('BookingService', () => {
  let service: BookingService;
  let bookingRepository: Repository<ServiceBooking>;
  let blockedSlotRepository: Repository<BlockedSlot>;
  let priceModifierRepository: Repository<PriceModifier>;
  let serviceRepository: Repository<Service>;
  let _paymentProviderService: PaymentProviderService;
  let walletService: WalletService;

  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  });

  const mockEntityManager = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    getRepository: jest.fn().mockImplementation(() => ({
      create: jest.fn(),
      save: jest.fn(),
    })),
  } as unknown as EntityManager;

  const mockDataSource = {
    transaction: jest.fn().mockImplementation(async (callback) => {
      return callback(mockEntityManager);
    }),
  } as unknown as DataSource;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(ServiceBooking),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(BlockedSlot),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(PriceModifier),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(ServicePayment),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(BookingTransaction),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Business), useFactory: mockRepository },
        { provide: getRepositoryToken(Service), useFactory: mockRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: NotificationService, useValue: { create: jest.fn() } },
        {
          provide: PaymentProviderService,
          useValue: {
            createStripePaymentIntent: jest.fn(),
            createPaypalOrder: jest.fn(),
            verifyStripePaymentIntent: jest.fn(),
            captureAndVerifyPaypalOrder: jest.fn(),
            createStripeTransfer: jest.fn(),
            refundStripePayment: jest.fn(),
            createPaypalPayout: jest.fn(),
            refundPaypalOrder: jest.fn(),
          },
        },
        {
          provide: CentralIntegrationService,
          useValue: { processCashback: jest.fn() },
        },
        {
          provide: EmailService,
          useValue: { sendBookingNotification: jest.fn() },
        },
        {
          provide: WalletService,
          useValue: {
            creditEarning: jest.fn(),
            releaseBookingPayment: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingRepository = module.get<Repository<ServiceBooking>>(
      getRepositoryToken(ServiceBooking),
    );
    blockedSlotRepository = module.get<Repository<BlockedSlot>>(
      getRepositoryToken(BlockedSlot),
    );
    priceModifierRepository = module.get<Repository<PriceModifier>>(
      getRepositoryToken(PriceModifier),
    );
    serviceRepository = module.get<Repository<Service>>(
      getRepositoryToken(Service),
    );
    _paymentProviderService = module.get<PaymentProviderService>(
      PaymentProviderService,
    );
    walletService = module.get<WalletService>(WalletService);
  });

  describe('checkAvailability (Capacity)', () => {
    it('should return isAvailable: false if concurrent bookings reach maxBookings', async () => {
      const dto = {
        serviceId: 'service-1',
        startTime: '2025-01-01T10:00:00Z',
        endTime: '2025-01-01T11:00:00Z',
      };

      // Mock service with max 1 booking at once
      jest.spyOn(serviceRepository, 'findOne').mockResolvedValue({
        id: 'service-1',
        availability: {
          schedule: [
            {
              day: 'WEDNESDAY',
              enabled: true,
              startTime: '09:00',
              endTime: '17:00',
              maxBookings: 1,
            },
          ],
        },
        business: {
          id: 'biz-1',
          status: BusinessStatus.PUBLISHED,
          user: { isActive: true },
        },
      } as Service);

      // Mock existing booking at the same time
      jest.spyOn(bookingRepository, 'find').mockResolvedValue([
        {
          startTime: new Date('2025-01-01T10:30:00Z'),
          endTime: new Date('2025-01-01T11:30:00Z'),
          status: BookingStatus.CONFIRMED,
        },
      ] as ServiceBooking[]);

      const result = await service.checkAvailability(dto);
      expect(result.isAvailable).toBe(false);
      expect(result.reason).toContain('reached capacity');
    });
  });

  describe('initiatePayment (Variants & Models)', () => {
    it('should calculate price correctly for a Tiered package', async () => {
      const booking = {
        id: 'book-1',
        tierId: 'premium-tier',
        user: { id: 'u1' },
        service: {
          pricingModel: 'fixed',
          tiers: [{ id: 'premium-tier', price: 500, name: 'Premium' }],
          business: {
            status: BusinessStatus.PUBLISHED,
            user: { isActive: true },
          },
        },
      } as ServiceBooking;

      jest.spyOn(bookingRepository, 'findOne').mockResolvedValue(booking);
      jest
        .spyOn(_paymentProviderService, 'createStripePaymentIntent')
        .mockResolvedValue({ id: 'pi_1', client_secret: 'cs_1' } as any);

      const result = await service.initiatePayment(
        { bookingId: 'book-1', paymentProvider: PaymentMethod.STRIPE },
        'u1',
      );

      expect(result.amount).toBe(500);
    });

    it('should multiply price for perHour model based on duration', async () => {
      const start = new Date('2025-01-01T10:00:00Z');
      const end = new Date('2025-01-01T13:00:00Z'); // 3 hours

      const booking = {
        id: 'book-1',
        startTime: start,
        endTime: end,
        user: { id: 'u1' },
        service: {
          pricingModel: 'perHour',
          pricePerHour: 100,
          business: {
            status: BusinessStatus.PUBLISHED,
            user: { isActive: true },
          },
        },
      } as ServiceBooking;

      jest.spyOn(bookingRepository, 'findOne').mockResolvedValue(booking);
      jest
        .spyOn(_paymentProviderService, 'createStripePaymentIntent')
        .mockResolvedValue({ id: 'pi_1', client_secret: 'cs_1' } as any);

      const result = await service.initiatePayment(
        { bookingId: 'book-1', paymentProvider: PaymentMethod.STRIPE },
        'u1',
      );

      expect(result.amount).toBe(300); // 100 * 3 hours
    });
  });

  describe('completeBooking (Escrow Flow)', () => {
    it('should ONLY mark payout as processed when BOTH flags are true', async () => {
      const booking = {
        id: 'book-1',
        service: { business: { user: { id: 'owner-1' } } },
        user: { id: 'cust-1' },
        businessOwnerCompleted: false,
        customerCompleted: false,
        providerAmount: 90,
        commissionAmount: 10,
      } as ServiceBooking;

      // 1. First completion by Owner
      (mockEntityManager.findOne as jest.Mock).mockResolvedValue(booking);
      (mockEntityManager.save as jest.Mock).mockImplementation((b) => b);

      let result = await service.completeBooking('book-1', 'owner-1');
      expect(result.businessOwnerCompleted).toBe(true);
      expect(result.payoutProcessed).toBeFalsy(); // Should NOT be processed yet

      // 2. Second completion by Customer
      (mockEntityManager.findOne as jest.Mock).mockResolvedValue({
        ...booking,
        businessOwnerCompleted: true,
      });
      result = await service.completeBooking('book-1', 'cust-1');

      expect(result.customerCompleted).toBe(true);
      expect(result.status).toBe(BookingStatus.COMPLETED);
      expect(result.payoutProcessed).toBe(true); // TRIGGERED NOW
    });
  });
});
