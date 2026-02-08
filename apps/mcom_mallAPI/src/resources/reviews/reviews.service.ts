import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';

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

  async findUserReviews(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({ where: { user: { id: userId } } });
  }

  async findBusinessReviews(businessId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { business: { id: businessId } },
    });
  }
}
