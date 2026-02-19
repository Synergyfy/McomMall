import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BookingService } from './booking.service';
import { ServiceBooking } from './entities/service-booking.entity';
import { BlockedSlot } from './entities/blocked-slot.entity';
import { PriceModifier } from './entities/price-modifier.entity';
import { ServicePayment } from './entities/service-payment.entity';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { ListingType } from '../listings/listing.enum';
import { BookingStatus } from './entities/booking.enum';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { WalletService } from '../wallet/wallet.service';
import { PaymentMethod } from '../order/entities/order-payment.entity';

describe('BookingService', () => {
  let service: BookingService;
  let bookingRepository: Repository<ServiceBooking>;
  let blockedSlotRepository: Repository<BlockedSlot>;
  let priceModifierRepository: Repository<PriceModifier>;
  let servicePaymentRepository: Repository<ServicePayment>;
  let businessRepository: Repository<Business>;
  let serviceRepository: Repository<Service>;
  let paymentProviderService: PaymentProviderService;
  let walletService: WalletService;

  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  });

  const mockEntityManager = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    getRepository: jest.fn().mockImplementation(() => ({
      create: jest.fn(),
      save: jest.fn(),
    })),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation(async (callback) => {
      return callback(mockEntityManager);
    }),
  };

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
          },
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
    servicePaymentRepository = module.get<Repository<ServicePayment>>(
      getRepositoryToken(ServicePayment),
    );
    businessRepository = module.get<Repository<Business>>(
      getRepositoryToken(Business),
    );
    serviceRepository = module.get<Repository<Service>>(
      getRepositoryToken(Service),
    );
    paymentProviderService = module.get<PaymentProviderService>(
      PaymentProviderService,
    );
    walletService = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkAvailability', () => {
    it('should return isAvailable: false if a slot is blocked', async () => {
      const dto = {
        serviceId: '1',
        startTime: '2025-01-01T10:00:00Z',
        endTime: '2025-01-01T11:00:00Z',
      };
      jest
        .spyOn(serviceRepository, 'findOne')
        .mockResolvedValue({ business: { id: '1' } } as Service);
      jest
        .spyOn(blockedSlotRepository, 'findOne')
        .mockResolvedValue({} as BlockedSlot);
      const result = await service.checkAvailability(dto);
      expect(result.isAvailable).toBe(false);
    });

    it('should return isAvailable: true and the correct priceMultiplier', async () => {
      const dto = {
        serviceId: '1',
        startTime: '2025-01-01T10:00:00Z',
        endTime: '2025-01-01T11:00:00Z',
      };
      jest
        .spyOn(serviceRepository, 'findOne')
        .mockResolvedValue({ business: { id: '1' } } as Service);
      jest.spyOn(blockedSlotRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(priceModifierRepository, 'findOne')
        .mockResolvedValue({ priceMultiplier: 1.5 } as PriceModifier);
      const result = await service.checkAvailability(dto);
      expect(result.isAvailable).toBe(true);
      expect(result.priceMultiplier).toBe(1.5);
    });
  });

  describe('create', () => {
    const createBookingDto = {
      serviceId: '1',
      startTime: '2025-01-01T10:00:00Z',
      endTime: '2025-01-01T11:00:00Z',
    };
    const userId = 'user-1';
    const serviceMock = {
      id: '1',
      business: {
        id: 'business-1',
        listingType: [ListingType.SERVICE],
        user: { id: 'business-owner-id' },
      },
    } as Service;

    it('should throw a ConflictException if the slot is not available', async () => {
      mockEntityManager.findOne
        .mockResolvedValueOnce(serviceMock)
        .mockResolvedValueOnce({} as BlockedSlot);
      await expect(service.create(createBookingDto, userId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create and return a booking if the slot is available', async () => {
      const booking = { id: 'booking-1', payment: null } as ServiceBooking;
      const payment = { id: 'payment-1' } as ServicePayment;
      const finalBooking = { ...booking, payment };

      mockEntityManager.findOne
        .mockResolvedValueOnce(serviceMock) // Service in _createBooking
        .mockResolvedValueOnce(null) // BlockedSlot in _createBooking
        .mockResolvedValueOnce(serviceMock) // Service in create
        .mockResolvedValueOnce(null); // PriceModifier in create

      mockEntityManager.create
        .mockReturnValueOnce(booking) // ServiceBooking
        .mockReturnValueOnce(payment); // ServicePayment

      mockEntityManager.save
        .mockResolvedValueOnce(booking) // save booking in _createBooking
        .mockResolvedValueOnce(payment) // save payment in create
        .mockResolvedValueOnce(finalBooking); // save booking with payment in create

      const result = await service.create(createBookingDto, userId);
      expect(result).toEqual(finalBooking);
    });

    it('should throw a ForbiddenException if the business does not offer services', async () => {
      const nonServiceBusinessMock = {
        ...serviceMock,
        business: {
          ...serviceMock.business,
          listingType: [ListingType.PRODUCT],
        },
      };
      mockEntityManager.findOne.mockResolvedValueOnce(nonServiceBusinessMock);
      await expect(service.create(createBookingDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('decline', () => {
    it('should throw NotFoundException if booking not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);
      await expect(service.decline('1', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the business owner', async () => {
      const booking = {
        service: { business: { user: { id: '2' } } },
      } as ServiceBooking;
      mockEntityManager.findOne.mockResolvedValue(booking);
      await expect(service.decline('1', '1')).rejects.toThrow(ForbiddenException);
    });

    it('should decline the booking and return it', async () => {
      const booking = {
        service: { business: { user: { id: '1' } } },
        status: BookingStatus.PENDING,
      } as ServiceBooking;
      const declinedBooking = { ...booking, status: BookingStatus.DECLINED };
      mockEntityManager.findOne.mockResolvedValue(booking);
      mockEntityManager.save.mockResolvedValue(declinedBooking);
      const result = await service.decline('1', '1');
      expect(result.status).toBe(BookingStatus.DECLINED);
    });
  });

  describe('approve', () => {
    it('should throw NotFoundException if booking not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);
      await expect(service.approve('1', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the business owner', async () => {
      const booking = {
        service: { business: { user: { id: '2' } } },
      } as ServiceBooking;
      mockEntityManager.findOne.mockResolvedValue(booking);
      await expect(service.approve('1', '1')).rejects.toThrow(ForbiddenException);
    });

    it('should approve the booking and return it', async () => {
      const booking = {
        service: { business: { user: { id: '1' } } },
        status: BookingStatus.PENDING,
      } as ServiceBooking;
      const approvedBooking = { ...booking, status: BookingStatus.APPROVED };
      mockEntityManager.findOne.mockResolvedValue(booking);
      mockEntityManager.save.mockResolvedValue(approvedBooking);
      const result = await service.approve('1', '1');
      expect(result.status).toBe(BookingStatus.APPROVED);
    });
  });

  describe('cancel', () => {
    it('should throw NotFoundException if booking not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);
      await expect(service.cancel('1', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the one who made the booking', async () => {
      const booking = { user: { id: '2' } } as unknown as ServiceBooking;
      mockEntityManager.findOne.mockResolvedValue(booking);
      await expect(service.cancel('1', '1')).rejects.toThrow(ForbiddenException);
    });

    it('should cancel the booking and return it', async () => {
      const booking = {
        user: { id: '1' },
        status: BookingStatus.PENDING,
      } as unknown as ServiceBooking;
      const cancelledBooking = { ...booking, status: BookingStatus.CANCELLED };
      mockEntityManager.findOne.mockResolvedValue(booking);
      mockEntityManager.save.mockResolvedValue(cancelledBooking);
      const result = await service.cancel('1', '1');
      expect(result.status).toBe(BookingStatus.CANCELLED);
    });
  });

  describe('initiatePayment', () => {
    it('should throw NotFoundException if booking not found', async () => {
      jest.spyOn(bookingRepository, 'findOne').mockResolvedValue(null);
      await expect(
        service.initiatePayment(
          { bookingId: '1', paymentProvider: PaymentMethod.STRIPE },
          '1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return a Stripe client secret', async () => {
      const booking = { service: { price: 100 } } as unknown as ServiceBooking;
      jest.spyOn(bookingRepository, 'findOne').mockResolvedValue(booking);
      jest
        .spyOn(paymentProviderService, 'createStripePaymentIntent')
        .mockResolvedValue({ client_secret: 'secret' } as any);

      const result = await service.initiatePayment(
        { bookingId: '1', paymentProvider: PaymentMethod.STRIPE },
        '1',
      );

      expect(result.clientSecret).toBe('secret');
    });

    it('should return a PayPal order ID', async () => {
      const booking = { service: { price: 100 } } as unknown as ServiceBooking;
      jest.spyOn(bookingRepository, 'findOne').mockResolvedValue(booking);
      jest
        .spyOn(paymentProviderService, 'createPaypalOrder')
        .mockResolvedValue({ id: 'order-id' } as any);

      const result = await service.initiatePayment(
        { bookingId: '1', paymentProvider: PaymentMethod.PAYPAL },
        '1',
      );

      expect(result.orderId).toBe('order-id');
    });
  });

  describe('verifyPayment', () => {
    const dto = {
      bookingId: '1',
      amount: 100,
      paymentProvider: PaymentMethod.STRIPE,
      transactionId: 'txn-1',
    };

    it('should throw NotFoundException if booking not found', async () => {
      jest.spyOn(bookingRepository, 'findOne').mockResolvedValue(null);
      await expect(service.verifyPayment(dto, '1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should verify payment and update booking', async () => {
      const booking = {
        id: '1',
        service: { business: { user: { id: '2' } } },
      } as ServiceBooking;
      const payment = {} as ServicePayment;
      jest.spyOn(bookingRepository, 'findOne').mockResolvedValue(booking);
      jest
        .spyOn(paymentProviderService, 'verifyStripePaymentIntent')
        .mockResolvedValue({ ok: true });
      (mockEntityManager.getRepository(ServicePayment).create as jest.Mock).mockReturnValue(payment);
      (mockEntityManager.getRepository(ServicePayment).save as jest.Mock).mockResolvedValue(payment);
      mockEntityManager.save.mockResolvedValue(booking);
      jest.spyOn(walletService, 'creditEarning').mockResolvedValue(null);

      const result = await service.verifyPayment(dto, '1');

      expect(walletService.creditEarning).toHaveBeenCalled();
      expect(result).toEqual(booking);
    });
  });

  describe('completeBooking', () => {
    it('should throw NotFoundException if booking not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);
      await expect(service.completeBooking('1', '1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should mark booking as completed by business owner', async () => {
      const booking = {
        id: '1',
        service: { business: { user: { id: '1' } } },
        user: { id: '2' },
        businessOwnerCompleted: false,
        customerCompleted: false,
      } as ServiceBooking;
      mockEntityManager.findOne.mockResolvedValue(booking);
      mockEntityManager.save.mockImplementation((booking) => booking);

      const result = await service.completeBooking('1', '1');
      expect(result.businessOwnerCompleted).toBe(true);
    });

    it('should release payment if both parties completed', async () => {
      const booking = {
        id: '1',
        service: { business: { user: { id: '1' } } },
        user: { id: '2' },
        businessOwnerCompleted: false,
        customerCompleted: true,
      } as ServiceBooking;
      mockEntityManager.findOne.mockResolvedValue(booking);
      mockEntityManager.save.mockImplementation((booking) => booking);
      jest.spyOn(walletService, 'releaseBookingPayment').mockResolvedValue(null);

      await service.completeBooking('1', '1');
      expect(walletService.releaseBookingPayment).toHaveBeenCalledWith('1');
    });
  });
});
