import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CheckoutService } from './checkout.service';
import { User } from '../users/entities/user.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Product } from '../product/entities/product.entity';
import { PromotionParticipant } from '../promotion/entities/promotion-participant.entity';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { GiftCardService } from '../gift-card/gift-card.service';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '../order/enums/order-status.enum';
import { CompleteCheckoutDto } from './dto/complete-checkout.dto';
import { Business } from '../listings/entities/listing.entity';
import { PaymentMethod } from '../order/entities/order-payment.entity';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let productRepository: Repository<Product>;
  let orderRepository: Repository<Order>;
  let orderItemRepository: Repository<OrderItem>;
  let giftCardService: GiftCardService;
  let paymentProviderService: PaymentProviderService;
  let dataSource: DataSource;

  const mockUserId = 'user-1';
  const mockOwner = { id: 'owner-1' } as User;
  const mockBusiness = { id: 'business-1', user: mockOwner } as Business;

  const mockProducts = [
    { id: 'prod-1', price: 10, business: mockBusiness },
    { id: 'prod-2', price: 20, business: mockBusiness },
  ] as Product[];

  const mockRepository = () => ({
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => Promise.resolve({ ...entity, id: 'new-id' })),
    findOne: jest.fn(),
    find: jest.fn(),
  });

  const mockGiftCardService = {
    checkBalance: jest.fn(),
    redeem: jest.fn(),
  };

  const mockPaymentProviderService = {
    createStripePaymentIntent: jest.fn(),
    verifyStripePaymentIntent: jest.fn(),
  };

  const mockManager = {
    save: jest.fn((entity) => Promise.resolve({ ...entity, id: 'saved-id' })),
    create: jest.fn((entity) => entity),
    getRepository: (entity) => {
      if (entity === Order) return orderRepository;
      if (entity === OrderItem) return orderItemRepository;
      return mockRepository();
    },
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb) => cb(mockManager)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: getRepositoryToken(User), useFactory: mockRepository },
        { provide: getRepositoryToken(Offer), useFactory: mockRepository },
        { provide: getRepositoryToken(Product), useFactory: mockRepository },
        {
          provide: getRepositoryToken(PromotionParticipant),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Order), useFactory: mockRepository },
        { provide: getRepositoryToken(OrderItem), useFactory: mockRepository },
        { provide: GiftCardService, useValue: mockGiftCardService },
        {
          provide: PaymentProviderService,
          useValue: mockPaymentProviderService,
        },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    orderItemRepository = module.get<Repository<OrderItem>>(
      getRepositoryToken(OrderItem),
    );
    giftCardService = module.get<GiftCardService>(GiftCardService);
    paymentProviderService = module.get<PaymentProviderService>(
      PaymentProviderService,
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiateCheckout', () => {
    it('should create a pending order and return payment intent if balance > 0', async () => {
      const dto: CreateCheckoutDto = {
        items: [{ productId: 'prod-1', quantity: 2 }], // Total: 20
      };
      jest
        .spyOn(productRepository, 'find')
        .mockResolvedValue([mockProducts[0]]);
      jest
        .spyOn(paymentProviderService, 'createStripePaymentIntent')
        .mockResolvedValue({ client_secret: 'secret' } as any);

      const result = await service.initiateCheckout(mockUserId, dto);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(orderRepository.save).toHaveBeenCalled();
      expect(orderItemRepository.save).toHaveBeenCalled();
      expect(
        paymentProviderService.createStripePaymentIntent,
      ).toHaveBeenCalledWith(20, 'GBP');
      expect(result.paymentRequired).toBe(true);
      expect(result.clientSecret).toBe('secret');
      expect(result.remainingTotal).toBe(20);
    });

    it('should apply gift card and require no payment if it covers the total', async () => {
      const dto: CreateCheckoutDto = {
        items: [{ productId: 'prod-1', quantity: 2 }], // Total: 20
        giftCardCode: 'GC123',
      };
      jest
        .spyOn(productRepository, 'find')
        .mockResolvedValue([mockProducts[0]]);
      jest.spyOn(giftCardService, 'checkBalance').mockResolvedValue({
        currentBalance: 50,
        initialBalance: 50,
        currency: 'GBP',
        expiryDate: null,
      });

      const result = await service.initiateCheckout(mockUserId, dto);

      expect(giftCardService.checkBalance).toHaveBeenCalledWith('GC123');
      expect(result.paymentRequired).toBe(false);
      expect(result.remainingTotal).toBe(0);
      const savedOrder = (orderRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedOrder.giftCardAmountApplied).toBe(20);
      expect(savedOrder.giftCardCode).toBe('GC123');
    });

    it('should partially apply gift card and require payment for the rest', async () => {
      const dto: CreateCheckoutDto = {
        items: [{ productId: 'prod-1', quantity: 3 }], // Total: 30
        giftCardCode: 'GC123',
      };
      jest
        .spyOn(productRepository, 'find')
        .mockResolvedValue([mockProducts[0]]);
      jest.spyOn(giftCardService, 'checkBalance').mockResolvedValue({
        currentBalance: 20,
        initialBalance: 50,
        currency: 'GBP',
        expiryDate: null,
      });
      jest
        .spyOn(paymentProviderService, 'createStripePaymentIntent')
        .mockResolvedValue({ client_secret: 'secret' } as any);

      const result = await service.initiateCheckout(mockUserId, dto);

      expect(result.paymentRequired).toBe(true);
      expect(result.remainingTotal).toBe(10);
      expect(
        paymentProviderService.createStripePaymentIntent,
      ).toHaveBeenCalledWith(10, 'GBP');
      const savedOrder = (orderRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedOrder.giftCardAmountApplied).toBe(20);
    });
  });

  describe('completeCheckout', () => {
    it('should complete order and redeem gift card if one was used', async () => {
      const pendingOrder = {
        id: 'order-1',
        total: 30,
        giftCardAmountApplied: 20,
        giftCardCode: 'GC123',
        status: OrderStatus.PENDING,
      } as Order;

      const orderWithItems = {
        ...pendingOrder,
        items: [{ product: { business: { id: 'business-1' } } }],
      } as Order;

      const dto: CompleteCheckoutDto = {
        orderId: 'order-1',
        paymentProvider: PaymentMethod.STRIPE,
        transactionId: 'pi_123',
      };

      jest
        .spyOn(orderRepository, 'findOne')
        .mockResolvedValueOnce(pendingOrder)
        .mockResolvedValueOnce(orderWithItems);
      jest
        .spyOn(paymentProviderService, 'verifyStripePaymentIntent')
        .mockResolvedValue({ ok: true });

      const result = await service.completeCheckout(mockUserId, dto);

      expect(
        paymentProviderService.verifyStripePaymentIntent,
      ).toHaveBeenCalledWith('pi_123', 10, 'GBP');
      expect(giftCardService.redeem).toHaveBeenCalledWith(
        { code: 'GC123', amount: 20 },
        expect.any(Object),
        'business-1',
      );
      expect(result.status).toBe(OrderStatus.COMPLETED);
    });

    it('should fail order if payment verification fails', async () => {
      const pendingOrder = {
        id: 'order-1',
        total: 30,
        giftCardAmountApplied: 0,
        status: OrderStatus.PENDING,
      } as Order;
      const dto: CompleteCheckoutDto = {
        orderId: 'order-1',
        transactionId: 'pi_123',
        paymentProvider: PaymentMethod.STRIPE,
      };
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(pendingOrder);
      jest
        .spyOn(paymentProviderService, 'verifyStripePaymentIntent')
        .mockResolvedValue({ ok: false, reason: 'card_declined' });

      await expect(service.completeCheckout(mockUserId, dto)).rejects.toThrow(
        new BadRequestException('Payment verification failed: card_declined'),
      );
      expect(orderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.FAILED }),
      );
    });

    it('should throw not found if order is not pending', async () => {
      const dto: CompleteCheckoutDto = { orderId: 'order-1' };
      (orderRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.completeCheckout(mockUserId, dto)).rejects.toThrow(
        new NotFoundException('Pending order not found.'),
      );
    });
  });
});
