import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepository: Repository<Review>;
  let businessRepository: Repository<Business>;

  const mockReviewRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockBusinessRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
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
    reviewRepository = module.get<Repository<Review>>(
      getRepositoryToken(Review),
    );
    businessRepository = module.get<Repository<Business>>(
      getRepositoryToken(Business),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new review', async () => {
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
        user,
        business,
      });
      expect(mockReviewRepository.save).toHaveBeenCalledWith(review);
    });
  });

  describe('findAll', () => {
    it('should return an array of reviews', async () => {
      const reviews = [new Review(), new Review()];
      mockReviewRepository.find.mockResolvedValue(reviews);

      const result = await service.findAll();

      expect(result).toEqual(reviews);
      expect(mockReviewRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single review', async () => {
      const review = new Review();
      mockReviewRepository.findOne.mockResolvedValue(review);

      const result = await service.findOne('1');

      expect(result).toEqual(review);
      expect(mockReviewRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('update', () => {
    it('should update a review', async () => {
      const updateReviewDto: UpdateReviewDto = {
        rating: 4,
        comment: 'Good',
      };
      const review = new Review();
      mockReviewRepository.update.mockResolvedValue(undefined);
      mockReviewRepository.findOne.mockResolvedValue(review);

      const result = await service.update('1', updateReviewDto);

      expect(result).toEqual(review);
      expect(mockReviewRepository.update).toHaveBeenCalledWith(
        '1',
        updateReviewDto,
      );
      expect(mockReviewRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('remove', () => {
    it('should remove a review', async () => {
      mockReviewRepository.delete.mockResolvedValue(undefined);

      await service.remove('1');

      expect(mockReviewRepository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('findUserReviews', () => {
    it('should return all reviews for a user', async () => {
      const reviews = [new Review(), new Review()];
      mockReviewRepository.find.mockResolvedValue(reviews);

      const result = await service.findUserReviews('1');

      expect(result).toEqual(reviews);
      expect(mockReviewRepository.find).toHaveBeenCalledWith({
        where: { user: { id: '1' } },
      });
    });
  });

  describe('findBusinessReviews', () => {
    it('should return all reviews for a business', async () => {
      const reviews = [new Review(), new Review()];
      mockReviewRepository.find.mockResolvedValue(reviews);

      const result = await service.findBusinessReviews('1');

      expect(result).toEqual(reviews);
      expect(mockReviewRepository.find).toHaveBeenCalledWith({
        where: { business: { id: '1' } },
      });
    });
  });
});
