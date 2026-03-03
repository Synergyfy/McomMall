import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { Review, ReviewStatus } from './entities/review.entity';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../common/role.enum';

describe('ReviewsService', () => {
  let service: ReviewsService;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  const mockReviewRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockBusinessRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockServiceRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
        {
          provide: getRepositoryToken(Business),
          useValue: mockBusinessRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Service),
          useValue: mockServiceRepository,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new review with PENDING status for a product', async () => {
      const createReviewDto: CreateReviewDto = {
        rating: 5,
        comment: 'Great product!',
        productId: 'prod-1',
      };
      const user = { id: 'user-1' } as User;
      const product = { id: 'prod-1' } as Product;
      const review = { id: 'rev-1', ...createReviewDto } as Review;

      mockProductRepository.findOne.mockResolvedValue(product);
      mockReviewRepository.create.mockReturnValue(review);
      mockReviewRepository.save.mockResolvedValue(review);
      mockQueryBuilder.getRawOne.mockResolvedValue({ avg: '5', count: '1' });

      const result = await service.create(createReviewDto, user);

      expect(result).toEqual(review);
      expect(mockReviewRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ReviewStatus.PENDING,
          product,
        }),
      );
      // Should recalculate
      expect(mockProductRepository.update).toHaveBeenCalledWith('prod-1', {
        averageRating: 5,
        reviewCount: 1,
      });
    });

    it('should create a new review with PENDING status for a service', async () => {
      const createReviewDto: CreateReviewDto = {
        rating: 4,
        comment: 'Good service!',
        serviceId: 'serv-1',
      };
      const user = { id: 'user-1' } as User;
      const serviceEntity = { id: 'serv-1' } as Service;
      const review = { id: 'rev-2', ...createReviewDto } as Review;

      mockServiceRepository.findOne.mockResolvedValue(serviceEntity);
      mockReviewRepository.create.mockReturnValue(review);
      mockReviewRepository.save.mockResolvedValue(review);
      mockQueryBuilder.getRawOne.mockResolvedValue({ avg: '4', count: '1' });

      const result = await service.create(createReviewDto, user);

      expect(result).toEqual(review);
      expect(mockReviewRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ReviewStatus.PENDING,
          service: serviceEntity,
        }),
      );
      expect(mockServiceRepository.update).toHaveBeenCalledWith('serv-1', {
        averageRating: 4,
        reviewCount: 1,
      });
    });
  });

  describe('publish', () => {
    it('should publish a review and recalculate ratings', async () => {
      const id = 'rev-1';
      const review = {
        id,
        status: ReviewStatus.PENDING,
        product: { id: 'prod-1' },
      } as Review;

      mockReviewRepository.findOne.mockResolvedValue(review);
      mockReviewRepository.save.mockResolvedValue({
        ...review,
        status: ReviewStatus.PUBLISHED,
      });
      mockQueryBuilder.getRawOne.mockResolvedValue({ avg: '4.5', count: '2' });

      await service.publish(id);

      expect(mockReviewRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ReviewStatus.PUBLISHED,
        }),
      );
      expect(mockProductRepository.update).toHaveBeenCalledWith('prod-1', {
        averageRating: 4.5,
        reviewCount: 2,
      });
    });
  });

  describe('unpublish', () => {
    it('should unpublish a review and recalculate ratings', async () => {
      const id = 'rev-1';
      const review = {
        id,
        status: ReviewStatus.PUBLISHED,
        service: { id: 'serv-1' },
      } as Review;

      mockReviewRepository.findOne.mockResolvedValue(review);
      mockReviewRepository.save.mockResolvedValue({
        ...review,
        status: ReviewStatus.PENDING,
      });
      mockQueryBuilder.getRawOne.mockResolvedValue({ avg: '0', count: '0' });

      await service.unpublish(id);

      expect(mockReviewRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ReviewStatus.PENDING,
        }),
      );
      expect(mockServiceRepository.update).toHaveBeenCalledWith('serv-1', {
        averageRating: 0,
        reviewCount: 0,
      });
    });
  });

  describe('remove', () => {
    it('should remove a review and recalculate ratings', async () => {
      const id = 'rev-1';
      const user = { id: 'user-1', role: UserRole.CUSTOMER } as User;
      const review = {
        id,
        user: { id: 'user-1' },
        business: { id: 'biz-1' },
      } as Review;

      mockReviewRepository.findOne.mockResolvedValue(review);
      mockQueryBuilder.getRawOne.mockResolvedValue({ avg: '3.0', count: '5' });

      await service.remove(id, user);

      expect(mockReviewRepository.remove).toHaveBeenCalled();
      expect(mockBusinessRepository.update).toHaveBeenCalledWith('biz-1', {
        averageRating: 3.0,
        reviewCount: 5,
      });
    });
  });
});
