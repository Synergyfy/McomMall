import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { VoucherService } from '../voucher.service';
import { Voucher, VoucherStatus } from '../entities/voucher.entity';
import { VoucherProduct } from '../entities/voucher-product.entity';
import { VoucherTransaction } from '../entities/voucher-transaction.entity';
import { Business } from '../../listings/entities/listing.entity';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../order/entities/order.entity';
import { OrderPayment } from '../../order/entities/order-payment.entity';
import { PaymentProviderService } from '../../payments/services/payment-provider.service';
import { WalletService } from '../../wallet/wallet.service';
import { InitiateReloadDto } from '../dto/initiate-reload.dto';
import { PaymentMethod } from '../../order/entities/order-payment.entity';
import { VerifyReloadDto } from '../dto/verify-reload.dto';

describe('VoucherService Reloads', () => {
  let service: VoucherService;
  let voucherRepository: Repository<Voucher>;
  let voucherProductRepository: Repository<VoucherProduct>;
  let paymentProviderService: PaymentProviderService;
  let walletService: WalletService;
  let dataSource: DataSource;

  const mockUser = { id: 'user-id', name: 'Test User' } as User;
  const mockVoucherProduct = {
    id: 'product-id',
    allowReloading: true,
    user: mockUser,
  } as VoucherProduct;

  const mockVoucher = {
    id: 'voucher-id',
    code: 'RELOAD123',
    balance: 50,
    status: VoucherStatus.UNREDEEMED,
    voucherProduct: mockVoucherProduct,
    owner: mockUser,
  } as Voucher;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoucherService,
        {
          provide: getRepositoryToken(Voucher),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(VoucherProduct),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(VoucherTransaction),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Business),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Order),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(OrderPayment),
          useClass: Repository,
        },
        {
          provide: PaymentProviderService,
          useValue: {
            createStripePaymentIntent: jest.fn(),
            verifyStripePaymentIntent: jest.fn(),
          },
        },
        {
          provide: WalletService,
          useValue: {
            creditEarning: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn().mockImplementation((callback) => callback({})),
          },
        },
      ],
    }).compile();

    service = module.get<VoucherService>(VoucherService);
    voucherRepository = module.get<Repository<Voucher>>(
      getRepositoryToken(Voucher),
    );
    voucherProductRepository = module.get<Repository<VoucherProduct>>(
      getRepositoryToken(VoucherProduct),
    );
    paymentProviderService =
      module.get<PaymentProviderService>(PaymentProviderService);
    walletService = module.get<WalletService>(WalletService);
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('initiateVoucherReload', () => {
    it('should successfully initiate a reload', async () => {
      const initiateDto: InitiateReloadDto = {
        amount: 25,
        paymentProvider: PaymentMethod.STRIPE,
      };

      jest
        .spyOn(service as any, 'findActiveVoucherByCode')
        .mockResolvedValue(mockVoucher as any);
      jest
        .spyOn(voucherProductRepository, 'findOneBy')
        .mockResolvedValue(mockVoucherProduct);
      jest
        .spyOn(paymentProviderService, 'createStripePaymentIntent')
        .mockResolvedValue({ client_secret: 'a-secret' } as any);

      const result = await service.initiateVoucherReload(
        'RELOAD123',
        initiateDto,
      );

      expect(result).toHaveProperty('clientSecret');
      expect(result.provider).toBe(PaymentMethod.STRIPE);
    });

    it('should throw an error if the voucher cannot be reloaded', async () => {
      const initiateDto: InitiateReloadDto = {
        amount: 25,
        paymentProvider: PaymentMethod.STRIPE,
      };
      const nonReloadableProduct = { ...mockVoucherProduct, allowReloading: false };
      const nonReloadableVoucher = {
        ...mockVoucher,
        voucherProduct: nonReloadableProduct,
      };

      jest
        .spyOn(service as any, 'findActiveVoucherByCode')
        .mockResolvedValue(nonReloadableVoucher as any);
      jest
        .spyOn(voucherProductRepository, 'findOneBy')
        .mockResolvedValue(nonReloadableProduct);

      await expect(
        service.initiateVoucherReload('RELOAD123', initiateDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyAndCompleteReload', () => {
    it('should successfully verify and complete a reload', async () => {
      const verifyDto: VerifyReloadDto = {
        reloadDetails: { amount: 25 },
        paymentProvider: PaymentMethod.STRIPE,
        transactionId: 'pi_123',
      };

      jest
        .spyOn(service as any, 'findActiveVoucherByCode')
        .mockResolvedValue(mockVoucher as any);
      jest
        .spyOn(voucherProductRepository, 'findOneBy')
        .mockResolvedValue(mockVoucherProduct);
      jest
        .spyOn(paymentProviderService, 'verifyStripePaymentIntent')
        .mockResolvedValue({ ok: true } as any);
      jest
        .spyOn(service as any, 'createTransaction')
        .mockResolvedValue(new VoucherTransaction());

      const mockEntityManager = {
        getRepository: jest.fn().mockReturnValue({
          create: jest.fn((entity) => entity),
          save: jest.fn((entity) => Promise.resolve(entity)),
        }),
      };

      jest
        .spyOn(dataSource as any, 'transaction')
        .mockImplementation(
          async (
            runInTransaction: (entityManager: any) => Promise<any>,
          ) => {
            return runInTransaction(mockEntityManager);
          },
        );

      await service.verifyAndCompleteReload(
        'RELOAD123',
        verifyDto,
        'user-id',
      );

      expect(walletService.creditEarning).toHaveBeenCalled();
    });

    it('should throw an error if payment verification fails', async () => {
      const verifyDto: VerifyReloadDto = {
        reloadDetails: { amount: 25 },
        paymentProvider: PaymentMethod.STRIPE,
        transactionId: 'pi_123',
      };

      jest
        .spyOn(service as any, 'findActiveVoucherByCode')
        .mockResolvedValue(mockVoucher as any);
      jest
        .spyOn(voucherProductRepository, 'findOneBy')
        .mockResolvedValue(mockVoucherProduct);
      jest
        .spyOn(paymentProviderService, 'verifyStripePaymentIntent')
        .mockResolvedValue({ ok: false, reason: 'failed' } as any);

      await expect(
        service.verifyAndCompleteReload('RELOAD123', verifyDto, 'user-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
