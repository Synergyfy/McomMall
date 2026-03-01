import { Test, TestingModule } from '@nestjs/testing';
import { OfferService } from './offer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Product } from '../product/entities/product.entity';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { TransactionService } from '../transaction/transaction.service';
import { PromotionParticipant } from '../promotion/entities/promotion-participant.entity';
import { NotFoundException } from '@nestjs/common';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityTimerService } from '../activity-timer/activity-timer.service';

const mockOfferRepository = {
  findOne: jest.fn(),
};
const mockProductRepository = {
  find: jest.fn(),
};
const mockBusinessRepository = {};
const mockUserRepository = {};
const mockTransactionService = {};
const mockPromotionParticipantRepository = {
  find: jest.fn(),
};

describe('OfferService', () => {
  let service: OfferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferService,
        { provide: getRepositoryToken(Offer), useValue: mockOfferRepository },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Business),
          useValue: mockBusinessRepository,
        },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: TransactionService, useValue: mockTransactionService },
        {
          provide: getRepositoryToken(PromotionParticipant),
          useValue: mockPromotionParticipantRepository,
        },
        {
          provide: ActivitiesService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: ActivityTimerService,
          useValue: {
            completeTaskByKey: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OfferService>(OfferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('applyOffer', () => {
    it('should throw NotFoundException if offer is not found', async () => {
      mockOfferRepository.findOne.mockResolvedValue(null);
      await expect(
        service.applyOffer('user-id', { offerId: 'offer-id', productIds: [] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user has insufficient points from the creator', async () => {
      const offer = {
        id: 'offer-id',
        points: 100,
        isActive: true,
        user: { id: 'creator-id' },
        includedProducts: [],
        excludedProducts: [],
      };
      // User has points, but not from the right creator
      const participations = [
        {
          pointsEarned: 100,
          promotion: {
            businesses: [{ user: { id: 'other-creator-id' } }],
          },
        },
      ];
      const products = [{ id: 'prod-id', price: 10 }];

      mockOfferRepository.findOne.mockResolvedValue(offer);
      mockPromotionParticipantRepository.find.mockResolvedValue(participations);
      (mockProductRepository.find as jest.Mock).mockResolvedValue(products);

      await expect(
        service.applyOffer('user-id', {
          offerId: 'offer-id',
          productIds: ['prod-id'],
        }),
      ).rejects.toThrow(
        'Insufficient points from this creator to redeem this offer.',
      );
    });

    it('should return valid if user has enough points from the creator', async () => {
      const offer = {
        id: 'offer-id',
        points: 100,
        isActive: true,
        user: { id: 'creator-id' },
        includedProducts: [],
        excludedProducts: [],
        rewardCouponType: 'FIXED_CART_DISCOUNT',
        discountAmount: 10,
      };
      const participations = [
        {
          pointsEarned: 100,
          promotion: {
            businesses: [{ user: { id: 'creator-id' } }],
          },
        },
      ];
      const products = [{ id: 'prod-id', price: 10, business: { id: 'b-1' } }];

      mockOfferRepository.findOne.mockResolvedValue(offer);
      mockPromotionParticipantRepository.find.mockResolvedValue(participations);
      (mockProductRepository.find as jest.Mock).mockResolvedValue(products);

      const result = await service.applyOffer('user-id', {
        offerId: 'offer-id',
        productIds: ['prod-id'],
      });

      expect(result.valid).toBe(true);
      expect(result.message).toBe('Offer is applicable.');
    });

    it('should throw BadRequestException if the offer is not active', async () => {
      const offer = {
        id: 'offer-id',
        points: 100,
        isActive: false,
        user: { id: 'creator-id' },
      };
      mockOfferRepository.findOne.mockResolvedValue(offer);

      await expect(
        service.applyOffer('user-id', { offerId: 'offer-id', productIds: [] }),
      ).rejects.toThrow('Offer is not active');
    });
  });
});
