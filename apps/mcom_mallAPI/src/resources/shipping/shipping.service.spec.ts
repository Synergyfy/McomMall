import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShippingService } from './shipping.service';
import { Order } from '../order/entities/order.entity';
import { Business } from '../listings/entities/listing.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ShippingStatus } from './enums/shipping-status.enum';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';

const mockOrderRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockBusinessRepository = {};

const mockEventEmitter = {
  emit: jest.fn(),
};

const mockHttpService = {
  post: jest.fn(() => of({ data: {} })),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'SHIPSTATION_API_KEY') return 'test-key';
    if (key === 'SHIPSTATION_API_SECRET') return 'test-secret';
    return null;
  }),
};

describe('ShippingService', () => {
  let service: ShippingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Business),
          useValue: mockBusinessRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ShippingService>(ShippingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateLabel', () => {
    it('should generate a label successfully for a valid order', async () => {
      const mockOrder = {
        id: 'order-123',
        total: 100,
        user: { email: 'test@example.com', name: 'Test User', trustScore: 100 },
        items: [
          {
            product: { sku: 'SKU1', title: 'Product 1' },
            quantity: 1,
            price: 100,
          },
        ],
        business: {
          businessName: 'Test Business',
          businessPhone: '1234567890',
          location: {
            addressLine1: '123 Business St',
            city: 'London',
            postcode: 'SW1A 1AA',
            countryCode: 'GB',
          },
        },
        created_at: new Date(),
        carrierCode: 'fedex',
      };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue({
        ...mockOrder,
        shippingStatus: ShippingStatus.LABEL_GENERATED,
        labelUrl: 'https://example.com/labels/123.pdf',
      });

      const result = await service.generateLabel('order-123');

      expect(result.labelUrl).toBeDefined();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'ORDER_LABEL_GENERATED',
        expect.anything(),
      );
    });

    it('should throw BadRequestException if fraud check fails', async () => {
      const riskyOrder = {
        id: 'order-risk',
        total: 1000, // High value
        user: { trustScore: 50 }, // Low trust
        business: { location: {} },
      };

      mockOrderRepository.findOne.mockResolvedValue(riskyOrder);

      await expect(service.generateLabel('order-risk')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
