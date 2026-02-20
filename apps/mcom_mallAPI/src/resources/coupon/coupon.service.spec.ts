import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CouponService } from './coupon.service';
import { Coupon } from './entities/coupon.entity';
import { MarketingCampaign } from '../campaign/entities/marketing-campaign.entity';
import { Business } from '../listings/entities/listing.entity';
import { BrandingAssociation } from './entities/branding-association.entity';
import {
  RedemptionLog,
  RedemptionStatus,
} from './entities/redemption-log.entity';
import { CouponStatus, CouponSourceType, DiscountType } from './coupon.enum';
import {
  MarketingCampaignStatus,
  MarketingCampaignType,
} from '../campaign/marketing-campaign.enum';
import { User } from '../users/entities/user.entity';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CapabilityService } from '../capability/capability.service';
import { ShippingAddress } from '../shipping-address/entities/shipping-address.entity';

describe('CouponService', () => {
  let service: CouponService;
  let couponRepo: Repository<Coupon>;
  let campaignRepo: Repository<MarketingCampaign>;
  let redemptionLogRepo: Repository<RedemptionLog>;
  let addressRepo: Repository<ShippingAddress>;
  let capabilityService: CapabilityService;

  const mockUser = { id: 'user-1' } as User;
  const mockCoupon = {
    id: 'coupon-1',
    code: 'SAVE10',
    status: CouponStatus.ACTIVE,
    sourceType: CouponSourceType.PLATFORM,
    discountValue: 10,
    discountType: DiscountType.FIXED,
    usageLimit: 0,
    perUserLimit: 1,
    expiresAt: null,
    campaign: null,
    business: null,
  } as Coupon;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        {
          provide: getRepositoryToken(Coupon),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MarketingCampaign),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Business),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BrandingAssociation),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RedemptionLog),
          useValue: {
            count: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ShippingAddress),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: CapabilityService,
          useValue: {
            checkPermission: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CouponService>(CouponService);
    couponRepo = module.get<Repository<Coupon>>(getRepositoryToken(Coupon));
    campaignRepo = module.get<Repository<MarketingCampaign>>(
      getRepositoryToken(MarketingCampaign),
    );
    redemptionLogRepo = module.get<Repository<RedemptionLog>>(
      getRepositoryToken(RedemptionLog),
    );
    addressRepo = module.get<Repository<ShippingAddress>>(
      getRepositoryToken(ShippingAddress),
    );
    capabilityService = module.get<CapabilityService>(CapabilityService);
  });

  describe('validateCoupon', () => {
    it('should throw NotFoundException if coupon does not exist', async () => {
      jest.spyOn(couponRepo, 'findOne').mockResolvedValue(null);
      await expect(
        service.validateCoupon('NONEXISTENT', mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if stacking is attempted', async () => {
      jest.spyOn(couponRepo, 'findOne').mockResolvedValue(mockCoupon);
      await expect(
        service.validateCoupon('SAVE10', mockUser, 'OTHERCODE'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if coupon is expired', async () => {
      const expiredCoupon = {
        ...mockCoupon,
        expiresAt: new Date(Date.now() - 10000),
      };
      jest
        .spyOn(couponRepo, 'findOne')
        .mockResolvedValue(expiredCoupon as Coupon);
      await expect(service.validateCoupon('SAVE10', mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if campaign is not active', async () => {
      const campaign = {
        status: MarketingCampaignStatus.DRAFT,
      } as MarketingCampaign;
      const couponWithCampaign = { ...mockCoupon, campaign };
      jest
        .spyOn(couponRepo, 'findOne')
        .mockResolvedValue(couponWithCampaign as Coupon);
      await expect(service.validateCoupon('SAVE10', mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if usage limit is reached', async () => {
      const limitedCoupon = { ...mockCoupon, usageLimit: 5 };
      jest
        .spyOn(couponRepo, 'findOne')
        .mockResolvedValue(limitedCoupon as Coupon);
      jest.spyOn(redemptionLogRepo, 'count').mockResolvedValue(5);
      await expect(service.validateCoupon('SAVE10', mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if per-user limit is reached', async () => {
      jest.spyOn(couponRepo, 'findOne').mockResolvedValue(mockCoupon);
      jest.spyOn(redemptionLogRepo, 'count').mockResolvedValue(1); // Already used once
      await expect(service.validateCoupon('SAVE10', mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return coupon if valid', async () => {
      jest.spyOn(couponRepo, 'findOne').mockResolvedValue(mockCoupon);
      jest.spyOn(redemptionLogRepo, 'count').mockResolvedValue(0);
      const result = await service.validateCoupon('SAVE10', mockUser);
      expect(result).toEqual(mockCoupon);
    });

    it('should throw BadRequestException if Hyperlocal campaign postal code does not match', async () => {
      const campaign = {
        type: MarketingCampaignType.HYPERLOCAL,
        status: MarketingCampaignStatus.ACTIVE,
        targetPostalCodes: ['SW1A', 'W1B'],
      } as MarketingCampaign;
      const coupon = { ...mockCoupon, campaign };

      jest.spyOn(couponRepo, 'findOne').mockResolvedValue(coupon as Coupon);
      jest
        .spyOn(addressRepo, 'findOne')
        .mockResolvedValue({ postalCode: 'E1 6AN' } as ShippingAddress);
      jest.spyOn(redemptionLogRepo, 'count').mockResolvedValue(0);

      await expect(service.validateCoupon('SAVE10', mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should succeed if Hyperlocal campaign postal code matches (prefix)', async () => {
      const campaign = {
        type: MarketingCampaignType.HYPERLOCAL,
        status: MarketingCampaignStatus.ACTIVE,
        targetPostalCodes: ['SW1A'],
      } as MarketingCampaign;
      const coupon = { ...mockCoupon, campaign };

      jest.spyOn(couponRepo, 'findOne').mockResolvedValue(coupon as Coupon);
      jest
        .spyOn(addressRepo, 'findOne')
        .mockResolvedValue({ postalCode: 'SW1A 1AA' } as ShippingAddress);
      jest.spyOn(redemptionLogRepo, 'count').mockResolvedValue(0);

      const result = await service.validateCoupon('SAVE10', mockUser);
      expect(result).toEqual(coupon);
    });

    it('should throw BadRequestException if Business coupon creator lacks capability', async () => {
      const businessUser = { id: 'bus-user-1' } as User;
      const business = { user: businessUser } as Business;
      const coupon = {
        ...mockCoupon,
        sourceType: CouponSourceType.BUSINESS,
        business,
      };

      jest.spyOn(couponRepo, 'findOne').mockResolvedValue(coupon as Coupon);
      jest.spyOn(redemptionLogRepo, 'count').mockResolvedValue(0);
      jest
        .spyOn(capabilityService, 'checkPermission')
        .mockRejectedValue(new ForbiddenException());

      await expect(service.validateCoupon('SAVE10', mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
