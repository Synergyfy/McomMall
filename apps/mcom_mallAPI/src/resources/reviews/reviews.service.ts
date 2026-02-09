import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Review, ReviewStatus } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { PageDto } from '../../common/dto/page.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async create(createReviewDto: CreateReviewDto, user: User): Promise<Review> {
    const business = await this.businessRepository.findOne({
      where: { id: createReviewDto.businessId },
    });
    const review = this.reviewRepository.create({
      ...createReviewDto,
      status: ReviewStatus.PENDING,
      user,
      business,
    });
    return this.reviewRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return this.reviewRepository.find();
  }

  async findOne(id: string): Promise<Review> {
    return this.reviewRepository.findOne({ where: { id } });
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    await this.reviewRepository.update(id, updateReviewDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.reviewRepository.delete(id);
  }

  async findUserReviews(userId: string, currentUser?: User): Promise<Review[]> {
    if (currentUser?.id === userId) {
      return this.reviewRepository.find({ where: { user: { id: userId } } });
    }
    return this.reviewRepository.find({
      where: {
        user: { id: userId },
        status: ReviewStatus.PUBLISHED,
      },
    });
  }

  async findBusinessReviews(
    businessId: string,
    currentUser?: User,
  ): Promise<Review[]> {
    const qb = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'reviewer')
      .leftJoinAndSelect('review.business', 'business')
      .leftJoinAndSelect('business.user', 'owner')
      .where('business.id = :businessId', { businessId });

    if (currentUser) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('review.status = :published', {
            published: ReviewStatus.PUBLISHED,
          })
            .orWhere('reviewer.id = :userId', { userId: currentUser.id })
            .orWhere('owner.id = :userId', { userId: currentUser.id });
        }),
      );
    } else {
      qb.andWhere('review.status = :published', {
        published: ReviewStatus.PUBLISHED,
      });
    }

    return qb.getMany();
  }

  async findAllAdmin(
    paginationQuery: PaginationQueryDto & { status?: ReviewStatus },
  ): Promise<PageDto<Review>> {
    const { page, limit, status } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.reviewRepository.createQueryBuilder('review');

    if (status) {
      queryBuilder.where('review.status = :status', { status });
    }

    queryBuilder
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.business', 'business')
      .orderBy('review.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: paginationQuery,
      totalItems: itemCount,
    });

    return new PageDto(entities, pageMetaDto);
  }

  async publish(id: string): Promise<Review> {
    const review = await this.findOne(id);
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    review.status = ReviewStatus.PUBLISHED;
    return this.reviewRepository.save(review);
  }

  async unpublish(id: string): Promise<Review> {
    const review = await this.findOne(id);
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    review.status = ReviewStatus.PENDING;
    return this.reviewRepository.save(review);
  }
}
