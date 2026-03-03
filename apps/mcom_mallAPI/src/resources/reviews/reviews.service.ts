import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(createReviewDto: CreateReviewDto, user: User): Promise<Review> {
    const { businessId, productId, serviceId, ...reviewData } = createReviewDto;

    let business: Business = null;
    let product: Product = null;
    let service: Service = null;

    if (businessId) {
      business = await this.businessRepository.findOne({
        where: { id: businessId },
        relations: ['user'],
      });
      if (!business) throw new NotFoundException('Business not found');
      if (business.user?.id === user.id) {
        throw new ForbiddenException('You cannot review your own business');
      }
    }

    if (productId) {
      product = await this.productRepository.findOne({
        where: { id: productId },
        relations: ['business', 'business.user', 'serviceProvider'],
      });
      if (!product) throw new NotFoundException('Product not found');

      const isOwner =
        product.business?.user?.id === user.id ||
        product.serviceProvider?.id === user.id;
      if (isOwner) {
        throw new ForbiddenException('You cannot review your own product');
      }
    }

    if (serviceId) {
      service = await this.serviceRepository.findOne({
        where: { id: serviceId },
        relations: ['business', 'business.user'],
      });
      if (!service) throw new NotFoundException('Service not found');
      if (service.business?.user?.id === user.id) {
        throw new ForbiddenException('You cannot review your own service');
      }
    }

    if (!business && !product && !service) {
      throw new ForbiddenException(
        'Review must be linked to a business, product, or service',
      );
    }

    const review = this.reviewRepository.create({
      ...reviewData,
      user,
      business,
      product,
      service,
      status: ReviewStatus.PENDING,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Recalculate ratings
    await this.recalculateRatings(businessId, productId, serviceId);

    return savedReview;
  }

  private async recalculateRatings(
    businessId?: string,
    productId?: string,
    serviceId?: string,
  ) {
    if (businessId) {
      const { avg, count } = await this.getStats('business_id', businessId);
      await this.businessRepository.update(businessId, {
        averageRating: avg,
        reviewCount: count,
      });
    }
    if (productId) {
      const { avg, count } = await this.getStats('product_id', productId);
      await this.productRepository.update(productId, {
        averageRating: avg,
        reviewCount: count,
      });
    }
    if (serviceId) {
      const { avg, count } = await this.getStats('service_id', serviceId);
      await this.serviceRepository.update(serviceId, {
        averageRating: avg,
        reviewCount: count,
      });
    }
  }

  private async getStats(
    column: string,
    id: string,
  ): Promise<{ avg: number; count: number }> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where(`review.${column} = :id`, { id })
      .andWhere('review.status = :status', { status: ReviewStatus.PUBLISHED })
      .getRawOne();

    return {
      avg: parseFloat(result.avg) || 0,
      count: parseInt(result.count) || 0,
    };
  }

  async findAll(): Promise<Review[]> {
    return this.reviewRepository.find({
      relations: ['user', 'business', 'product', 'service'],
      where: { status: ReviewStatus.PUBLISHED },
    });
  }

  async findAllAdmin(query: any): Promise<any> {
    const { status, page = 1, limit = 10 } = query;
    const [items, total] = await this.reviewRepository.findAndCount({
      where: status ? { status } : {},
      relations: ['user', 'business', 'product', 'service'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { items, total, page, limit };
  }

  async findOne(id: string, user?: User): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'business', 'product', 'service'],
    });

    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    user: User,
  ): Promise<Review> {
    const review = await this.findOne(id);
    if (review.user.id !== user.id)
      throw new ForbiddenException('Not authorized');

    Object.assign(review, updateReviewDto);
    const updated = await this.reviewRepository.save(review);

    await this.recalculateRatings(
      review.business?.id,
      review.product?.id,
      review.service?.id,
    );

    return updated;
  }

  async remove(id: string, user: User): Promise<void> {
    const review = await this.findOne(id);
    // Admin can delete any review, user only their own
    // Simplified: check user id
    if (user.role !== 'admin' && review.user.id !== user.id) {
      throw new ForbiddenException('Not authorized');
    }

    await this.reviewRepository.remove(review);

    await this.recalculateRatings(
      review.business?.id,
      review.product?.id,
      review.service?.id,
    );
  }

  async publish(id: string): Promise<Review> {
    const review = await this.findOne(id);
    review.status = ReviewStatus.PUBLISHED;
    const updated = await this.reviewRepository.save(review);
    await this.recalculateRatings(
      review.business?.id,
      review.product?.id,
      review.service?.id,
    );
    return updated;
  }

  async unpublish(id: string): Promise<Review> {
    const review = await this.findOne(id);
    review.status = ReviewStatus.PENDING;
    const updated = await this.reviewRepository.save(review);
    await this.recalculateRatings(
      review.business?.id,
      review.product?.id,
      review.service?.id,
    );
    return updated;
  }

  async findUserReviews(userId: string, user?: User): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { user: { id: userId }, status: ReviewStatus.PUBLISHED },
      relations: ['business', 'product', 'service'],
    });
  }

  async findBusinessReviews(
    businessId: string,
    user?: User,
  ): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { business: { id: businessId }, status: ReviewStatus.PUBLISHED },
      relations: ['user'],
    });
  }

  async findProductReviews(productId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { product: { id: productId }, status: ReviewStatus.PUBLISHED },
      relations: ['user'],
    });
  }

  async findServiceReviews(serviceId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { service: { id: serviceId }, status: ReviewStatus.PUBLISHED },
      relations: ['user'],
    });
  }
}
