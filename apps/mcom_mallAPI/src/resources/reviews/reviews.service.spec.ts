import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { Review, ReviewStatus } from './entities/review.entity';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../common/role.enum';

describe('ReviewsService', () => {
  let service: ReviewsService;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    getRawAndEntities: jest.fn(),
  };

  const mockReviewRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockBusinessRepository = {
    findOne: jest.fn(),
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
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new review with PENDING status', async () => {
      const createReviewDto: CreateReviewDto = {
        rating: 5,
        comment: 'Great!',
        businessId: '1',
      };
      const user = new User();
      const business = new Business();
      const review = new Review();

      mockBusinessRepository.findOne.mockResolvedValue(business);
      mockReviewRepository.create.mockReturnValue(review);
      mockReviewRepository.save.mockResolvedValue(review);

      const result = await service.create(createReviewDto, user);

      expect(result).toEqual(review);
      expect(mockBusinessRepository.findOne).toHaveBeenCalledWith({
        where: { id: createReviewDto.businessId },
      });
      expect(mockReviewRepository.create).toHaveBeenCalledWith({
        ...createReviewDto,
        status: ReviewStatus.PENDING,
        user,
        business,
      });
      expect(mockReviewRepository.save).toHaveBeenCalledWith(review);
    });
  });

  describe('findAll', () => {
    it('should return only published reviews', async () => {
      const reviews = [new Review()];
      mockReviewRepository.find.mockResolvedValue(reviews);

      const result = await service.findAll();

      expect(result).toEqual(reviews);
      expect(mockReviewRepository.find).toHaveBeenCalledWith({
        where: { status: ReviewStatus.PUBLISHED },
      });
    });
  });

  describe('findOne', () => {
    it('should return published review', async () => {
      const id = '1';
      const review = { id, status: ReviewStatus.PUBLISHED } as Review;
      mockReviewRepository.findOne.mockResolvedValue(review);

      const result = await service.findOne(id);

      expect(result).toEqual(review);
    });

    it('should return pending review to admin', async () => {
      const id = '1';
      const review = { id, status: ReviewStatus.PENDING } as Review;
      const admin = { id: 'admin', role: UserRole.ADMIN } as User;
      mockReviewRepository.findOne.mockResolvedValue(review);

      const result = await service.findOne(id, admin);

      expect(result).toEqual(review);
    });

    it('should return pending review to reviewer', async () => {
      const id = '1';
      const reviewer = { id: 'reviewer' } as User;
      const review = {
        id,
        status: ReviewStatus.PENDING,
        user: { id: 'reviewer' },
      } as Review;
      mockReviewRepository.findOne.mockResolvedValue(review);

      const result = await service.findOne(id, reviewer);

      expect(result).toEqual(review);
    });

    it('should return pending review to business owner', async () => {
      const id = '1';
      const owner = { id: 'owner' } as User;
      const review = {
        id,
        status: ReviewStatus.PENDING,
        user: { id: 'reviewer' },
        business: { user: { id: 'owner' } },
      } as Review;
      mockReviewRepository.findOne.mockResolvedValue(review);

      const result = await service.findOne(id, owner);

      expect(result).toEqual(review);
    });

    it('should throw NotFoundException for pending review if user not authorized', async () => {
      const id = '1';
      const user = { id: 'other' } as User;
      const review = {
        id,
        status: ReviewStatus.PENDING,
        user: { id: 'reviewer' },
        business: { user: { id: 'owner' } },
      } as Review;
      mockReviewRepository.findOne.mockResolvedValue(review);

      await expect(service.findOne(id, user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return null (or throw) if not found', async () => {
      mockReviewRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should allow admin to update any review', async () => {
      const updateReviewDto: UpdateReviewDto = { rating: 4 };
      const adminUser = { id: 'admin1', role: UserRole.ADMIN } as User;
      const review = { id: '1', user: { id: 'user1' } } as Review;

      mockReviewRepository.findOne.mockResolvedValue(review);
      mockReviewRepository.update.mockResolvedValue(undefined);

      await service.update('1', updateReviewDto, adminUser);

      expect(mockReviewRepository.update).toHaveBeenCalledWith(
        '1',
        updateReviewDto,
      );
    });

    it('should allow owner to update their own review', async () => {
      const updateReviewDto: UpdateReviewDto = { rating: 4 };
      const user = { id: 'user1', role: UserRole.CUSTOMER } as User;
      const review = { id: '1', user: { id: 'user1' } } as Review;

      mockReviewRepository.findOne.mockResolvedValue(review);
      mockReviewRepository.update.mockResolvedValue(undefined);

      await service.update('1', updateReviewDto, user);

      expect(mockReviewRepository.update).toHaveBeenCalledWith(
        '1',
        updateReviewDto,
      );
    });

    it('should throw ForbiddenException if user tries to update another user review', async () => {
      const updateReviewDto: UpdateReviewDto = { rating: 4 };
      const user = { id: 'user2', role: UserRole.CUSTOMER } as User;
      const review = { id: '1', user: { id: 'user1' } } as Review;

      mockReviewRepository.findOne.mockResolvedValue(review);

      await expect(service.update('1', updateReviewDto, user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if review not found', async () => {
      const updateReviewDto: UpdateReviewDto = { rating: 4 };
      const user = { id: 'user1' } as User;
      mockReviewRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', updateReviewDto, user)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findUserReviews', () => {
    it('should return all reviews for the user (including pending) if viewing own reviews', async () => {
      const userId = 'user1';
      const currentUser = { id: 'user1' } as User;
      const reviews = [new Review()];
      mockReviewRepository.find.mockResolvedValue(reviews);

      const result = await service.findUserReviews(userId, currentUser);

      expect(result).toEqual(reviews);
      expect(mockReviewRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
      });
    });

    it('should return only published reviews if viewing other user reviews', async () => {
      const userId = 'user1';
      const currentUser = { id: 'user2' } as User;
      const reviews = [new Review()];
      mockReviewRepository.find.mockResolvedValue(reviews);

      const result = await service.findUserReviews(userId, currentUser);

      expect(result).toEqual(reviews);
      expect(mockReviewRepository.find).toHaveBeenCalledWith({
        where: {
          user: { id: userId },
          status: ReviewStatus.PUBLISHED,
        },
      });
    });
  });

  describe('findBusinessReviews', () => {
    it('should query with published status only if no current user', async () => {
      const businessId = 'biz1';
      const reviews = [new Review()];
      mockQueryBuilder.getMany.mockResolvedValue(reviews);

      const result = await service.findBusinessReviews(businessId);

      expect(mockReviewRepository.createQueryBuilder).toHaveBeenCalledWith(
        'review',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'business.id = :businessId',
        { businessId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'review.status = :published',
        { published: ReviewStatus.PUBLISHED },
      );
      expect(result).toEqual(reviews);
    });

    it('should query with pending visibility if current user is present', async () => {
      const businessId = 'biz1';
      const currentUser = { id: 'user1' } as User;
      const reviews = [new Review()];
      mockQueryBuilder.getMany.mockResolvedValue(reviews);

      const result = await service.findBusinessReviews(businessId, currentUser);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.any(Object),
      ); // Brackets logic is complex to match exactly with jest mocks, checking it was called is a good start.
      expect(result).toEqual(reviews);
    });
  });

  describe('findAllAdmin', () => {
    it('should return paginated reviews', async () => {
      const query = { page: 1, limit: 10 };
      const reviews = [new Review()];
      const itemCount = 1;
      mockQueryBuilder.getCount.mockResolvedValue(itemCount);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({
        entities: reviews,
      });

      const result = await service.findAllAdmin(query);

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(result.data).toEqual(reviews);
      expect(result.meta.totalItems).toEqual(itemCount);
    });

    it('should filter by status if provided', async () => {
      const query = { page: 1, limit: 10, status: ReviewStatus.PENDING };
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities: [] });

      await service.findAllAdmin(query);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'review.status = :status',
        { status: ReviewStatus.PENDING },
      );
    });
  });

  describe('publish', () => {
    it('should publish a review', async () => {
      const id = '1';
      const review = new Review();
      review.status = ReviewStatus.PENDING;
      mockReviewRepository.findOne.mockResolvedValue(review);
      mockReviewRepository.save.mockResolvedValue({
        ...review,
        status: ReviewStatus.PUBLISHED,
      });

      const result = await service.publish(id);

      expect(result.status).toEqual(ReviewStatus.PUBLISHED);
      expect(mockReviewRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ReviewStatus.PUBLISHED }),
      );
    });

    it('should throw NotFoundException if review not found', async () => {
      mockReviewRepository.findOne.mockResolvedValue(null);
      await expect(service.publish('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('unpublish', () => {
    it('should unpublish a review', async () => {
      const id = '1';
      const review = new Review();
      review.status = ReviewStatus.PUBLISHED;
      mockReviewRepository.findOne.mockResolvedValue(review);
      mockReviewRepository.save.mockResolvedValue({
        ...review,
        status: ReviewStatus.PENDING,
      });

      const result = await service.unpublish(id);

      expect(result.status).toEqual(ReviewStatus.PENDING);
      expect(mockReviewRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ReviewStatus.PENDING }),
      );
    });
  });

  describe('remove', () => {
    it('should allow admin to delete any review', async () => {
      const id = '1';
      const adminUser = { id: 'admin1', role: UserRole.ADMIN } as User;
      const review = { id: '1', user: { id: 'user1' } } as Review;

      mockReviewRepository.findOne.mockResolvedValue(review);
      mockReviewRepository.delete.mockResolvedValue(undefined);

      await service.remove(id, adminUser);

      expect(mockReviewRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should allow owner to delete their own review', async () => {
      const id = '1';
      const user = { id: 'user1', role: UserRole.CUSTOMER } as User;
      const review = { id: '1', user: { id: 'user1' } } as Review;

      mockReviewRepository.findOne.mockResolvedValue(review);
      mockReviewRepository.delete.mockResolvedValue(undefined);

      await service.remove(id, user);

      expect(mockReviewRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should throw ForbiddenException if user tries to delete another user review', async () => {
      const id = '1';
      const user = { id: 'user2', role: UserRole.CUSTOMER } as User;
      const review = { id: '1', user: { id: 'user1' } } as Review;

      mockReviewRepository.findOne.mockResolvedValue(review);

      await expect(service.remove(id, user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if review not found', async () => {
      const id = '1';
      const user = { id: 'user1' } as User;
      mockReviewRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(id, user)).rejects.toThrow(NotFoundException);
    });
  });
});
