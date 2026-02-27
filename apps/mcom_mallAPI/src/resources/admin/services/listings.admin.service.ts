import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from 'src/resources/listings/entities/listing.entity';
import { Repository } from 'typeorm';
import {
  ListingQueryDto,
  PaginatedListingsDto,
  AdminListingDto,
} from '../dto/listings.dto';

@Injectable()
export class AdminListingsService {
  constructor(
    @InjectRepository(Business)
    private listingsRepository: Repository<Business>,
  ) {}

  async findAll(query: ListingQueryDto): Promise<PaginatedListingsDto> {
    const { search, status, category, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const qb = this.listingsRepository
      .createQueryBuilder('business')
      .leftJoinAndSelect('business.user', 'user')
      .leftJoinAndSelect('business.sector', 'sector')
      .leftJoinAndSelect('business.category', 'category')
      .leftJoinAndSelect('business.location', 'location')
      .leftJoinAndSelect('business.reviews', 'reviews')
      .take(limit)
      .skip(skip)
      .orderBy('business.created_at', 'DESC');

    if (search) {
      qb.andWhere(
        '(business.businessName ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('business.status = :status', { status });
    }

    if (category) {
      qb.andWhere('category.name ILIKE :category', {
        category: `%${category}%`,
      });
    }

    const [listings, total] = await qb.getManyAndCount();

    const mappedData: AdminListingDto[] = listings.map((b) => {
      // Basic rating calculation (average of review ratings if available)
      const rating = b.reviews?.length
        ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length
        : 0;

      return {
        id: b.id,
        businessName: b.businessName,
        ownerName: b.user
          ? `${b.user.firstName} ${b.user.lastName}`
          : 'Unknown',
        ownerEmail: b.user?.email || '',
        category: b.category?.name || 'Uncategorized',
        sector: b.sector?.name || 'N/A',
        status: b.status,
        isVerified: b.isVerified,
        rating: Number(rating.toFixed(1)),
        reviewCount: b.reviews?.length || 0,
        location: b.location
          ? `${b.location.addressLine1}, ${b.location.city}`
          : 'No Location',
        description: b.shortDescription,
        images: b.media || [],
        createdAt: b.created_at,
      };
    });

    return {
      data: mappedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
