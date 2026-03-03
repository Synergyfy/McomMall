import { Test, TestingModule } from '@nestjs/testing';
import { RoyalMailService } from './royal-mail.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ShippingStatus } from './enums/shipping-status.enum';
import { Order } from '../order/entities/order.entity';
import { DeepPartial } from 'typeorm';
import { AxiosResponse } from 'axios';

describe('RoyalMailService', () => {
  let service: RoyalMailService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'ROYAL_MAIL_CLIENT_ID') return 'test_client_id';
      if (key === 'ROYAL_MAIL_CLIENT_SECRET') return 'test_client_secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoyalMailService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<RoyalMailService>(RoyalMailService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAccessToken', () => {
    it('should fetch and return a new token', async () => {
      const mockTokenResponse: DeepPartial<AxiosResponse> = {
        data: {
          xRMGAuthToken: 'mock_token',
          expires_in: 14400,
        },
      };
      mockHttpService.post.mockReturnValue(of(mockTokenResponse as AxiosResponse));

      const token = await (service as any).getAccessToken();
      expect(token).toBe('mock_token');
      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/token'),
        {},
        expect.objectContaining({
          headers: {
            'X-IBM-Client-Id': 'test_client_id',
            'X-IBM-Client-Secret': 'test_client_secret',
          },
        }),
      );
    });

    it('should throw InternalServerErrorException if credentials are missing', async () => {
      mockConfigService.get.mockReturnValue(null);
      await expect((service as any).getAccessToken()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('createShipment', () => {
    const mockOrder: DeepPartial<Order> = {
      id: 'order_id',
      user: { email: 'user@example.com' },
      shippingAddress: {
        recipientName: 'John Doe',
        phoneNumber: '1234567890',
        addressLine1: '123 Test St',
        addressLine2: 'Apt 1',
        city: 'London',
        postalCode: 'SW1A 1AA',
      },
      items: [
        { product: { weight: 200 }, quantity: 2 } as any,
      ],
    };

    it('should create a shipment and return shipmentId and trackingNumber', async () => {
      // Mock token
      (service as any).accessToken = 'mock_token';
      (service as any).tokenExpiry = Date.now() + 10000;

      const mockShipmentResponse: DeepPartial<AxiosResponse> = {
        data: {
          shipments: [
            {
              shipment_id: 'rm_shipment_id',
              tracking_number: 'RM123456789GB',
            },
          ],
        },
      };
      mockHttpService.post.mockReturnValue(of(mockShipmentResponse as AxiosResponse));

      const result = await service.createShipment(mockOrder as Order);
      expect(result).toEqual({
        shipmentId: 'rm_shipment_id',
        trackingNumber: 'RM123456789GB',
      });
    });

    it('should throw BadRequestException if shippingAddress is missing', async () => {
      const orderWithoutAddress: DeepPartial<Order> = { ...mockOrder, shippingAddress: null };
      await expect(service.createShipment(orderWithoutAddress as Order)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTrackingSummary', () => {
    it('should return mapped status for Delivered', async () => {
      (service as any).accessToken = 'mock_token';
      (service as any).tokenExpiry = Date.now() + 10000;

      const mockTrackingResponse: DeepPartial<AxiosResponse> = {
        data: {
          mailpiece: {
            summary_status: 'Delivered',
            status_date_time: '2023-10-01T10:00:00Z',
          },
        },
      };
      mockHttpService.get.mockReturnValue(of(mockTrackingResponse as AxiosResponse));

      const result = await service.getTrackingSummary('RM123456789GB');
      expect(result?.status).toBe(ShippingStatus.DELIVERED);
    });

    it('should return mapped status for Transit', async () => {
      (service as any).accessToken = 'mock_token';
      (service as any).tokenExpiry = Date.now() + 10000;

      const mockTrackingResponse: DeepPartial<AxiosResponse> = {
        data: {
          mailpiece: {
            summary_status: 'In Transit',
            status_date_time: '2023-10-01T10:00:00Z',
          },
        },
      };
      mockHttpService.get.mockReturnValue(of(mockTrackingResponse as AxiosResponse));

      const result = await service.getTrackingSummary('RM123456789GB');
      expect(result?.status).toBe(ShippingStatus.SHIPPED);
    });
  });
});
