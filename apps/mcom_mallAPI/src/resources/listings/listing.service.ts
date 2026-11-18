import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from './entities/listing.entity';
import { Sector } from '../taxonomy/entities/sector.entity';
import { TaxonomyCategory } from '../taxonomy/entities/taxonomy-category.entity';
import { TaxonomySubcategory } from '../taxonomy/entities/taxonomy-subcategory.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { BusinessStatus, ListingType } from './listing.enum';
import { UpdateBusinessDto } from './dto/listings.dto';
import { User } from '../users/entities/user.entity';
import { SearchBusinessDto } from './dto/listings.dto';
import { ActivitiesService } from '../activities/activities.service';
import { ListingPublicDto } from './dto/listing-public.dto';
import { ApprovalStatus } from '../../common/moderation/catalog-approval';
import { UserRole } from '../../common/role.enum';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
    @InjectRepository(TaxonomyCategory)
    private readonly taxonomyCategoryRepository: Repository<TaxonomyCategory>,
    @InjectRepository(TaxonomySubcategory)
    private readonly taxonomySubcategoryRepository: Repository<TaxonomySubcategory>,
    private readonly dataSource: DataSource,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async findAllForUser(userId: string, page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const whereCondition: any = { user: { id: userId } };
    if (status) {
      whereCondition.status = status;
    }
    const [data, total] = await this.businessRepository.findAndCount({
      where: whereCondition,
      relations: [
        'sector',
        'category',
        'subCategory',
        'location',
        'productSellerProfile',
        'serviceProviderProfile',
      ],
      order: { created_at: 'DESC' },
      take: limit,
      skip: skip,
    });

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findRecent(limit = 6): Promise<Business[]> {
    return this.businessRepository.find({
      take: limit,
      order: { created_at: 'DESC' },
      relations: ['sector', 'category', 'subCategory', 'location'],
    });
  }

  async findOne(id: string, userId: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: [
        'user',
        'location',
        'socialLinks',
        'sector',
        'category',
        'subCategory',
        'businessHours',
        'specialDays',
        'productSellerProfile',
        'productSellerProfile.storefrontLinks',
        'serviceProviderProfile',
        'serviceProviderProfile.certifications',
      ],
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found.`);
    }

    // Explicitly check for user ownership
    if (business.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    return business;
  }

  async findOnePublic(id: string, user?: User): Promise<ListingPublicDto> {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: [
        'user',
        'location',
        'socialLinks',
        'sector',
        'category',
        'subCategory',
        'businessHours',
        'specialDays',
        'products',
        'productSellerProfile',
        'productSellerProfile.storefrontLinks',
        'serviceProviderProfile',
        'serviceProviderProfile.certifications',
      ],
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found.`);
    }

    const response = {
      ...business,
      giftCard: business.user.giftCard,
      voucher: business.user.voucher,
    };

    const canSeeUnapproved =
      !!user &&
      (user.role === UserRole.ADMIN || business.user?.id === user.id);

    if (!canSeeUnapproved) {
      response.products = (business.products || []).filter(
        (product) =>
          product.approvalStatus === ApprovalStatus.APPROVED &&
          product.productStatus === 'published' &&
          product.visibility === 'public' &&
          !product.adminDisabled,
      );
    }

    return response;
  }

  async update(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
    userId: string,
  ): Promise<Business> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Fetch the existing business with all its relations within the transaction
      const business = await queryRunner.manager.findOne(Business, {
        where: { id, user: { id: userId } },
        relations: [
          'user',
          'location',
          'socialLinks',
          'sector',
          'category',
          'subCategory',
          'businessHours',
          'specialDays',
          'productSellerProfile',
          'productSellerProfile.storefrontLinks',
          'serviceProviderProfile',
          'serviceProviderProfile.certifications',
        ],
      });

      if (!business) {
        throw new ForbiddenException(
          'Business not found or you do not have permission to edit this.',
        );
      }

      const { ...restOfDto } = updateBusinessDto;

      // Merge the DTO into the loaded entity. This handles partial updates of nested objects.
      this.businessRepository.merge(business, restOfDto);

      // Handle category updates separately if categoryIds are provided
      // Handle Taxonomy updates
      if (updateBusinessDto.sectorId) {
        const sector = await this.sectorRepository.findOne({
          where: { id: updateBusinessDto.sectorId },
        });
        if (!sector) throw new BadRequestException('Invalid Sector ID');
        business.sector = sector;
      }

      if (updateBusinessDto.categoryId) {
        const category = await this.taxonomyCategoryRepository.findOne({
          where: { id: updateBusinessDto.categoryId },
        });
        if (!category) throw new BadRequestException('Invalid Category ID');

        // If a new sector was set, validate against it. Otherwise validate against existing sector.
        const sectorIdToCheck =
          business.sector?.id || (await business.sector)?.id; // Accessing existing value might need await if lazy, but here it is eager loaded? No, relations are loaded in findOne above.

        // Wait, verify if we loaded relations in update transaction?
        // Yes, lines 286-300 load relations.

        if (category.sectorId !== business.sector?.id) {
          // If the user changed the category but the new category doesn't match the current sector (and they didn't change the sector OR they changed the sector and it still doesn't match)
          throw new BadRequestException(
            'Selected Category does not belong to the selected Sector',
          );
        }
        business.category = category;
      }

      if (updateBusinessDto.subCategoryId) {
        const subCategory = await this.taxonomySubcategoryRepository.findOne({
          where: { id: updateBusinessDto.subCategoryId },
        });
        if (!subCategory)
          throw new BadRequestException('Invalid SubCategory ID');

        if (subCategory.categoryId !== business.category?.id) {
          throw new BadRequestException(
            'Selected SubCategory does not belong to the selected Category',
          );
        }
        business.subCategory = subCategory;
      }

      // Business logic check: prevent removing location if the business sells products
      const finalListingType =
        updateBusinessDto.listingType || business.listingType;
      if (
        finalListingType.includes(ListingType.PRODUCT) &&
        updateBusinessDto.location === null
      ) {
        throw new BadRequestException(
          'Cannot remove location from a business that sells products.',
        );
      }

      const updatedBusiness = await queryRunner.manager.save(business);
      await this.activitiesService.create(
        business.user,
        'updated',
        'listing',
        updatedBusiness.businessName,
      );
      await queryRunner.commitTransaction();

      // It's good practice to return the full, updated entity, including all relations.
      return this.findOne(updatedBusiness.id, userId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Failed to update listing: ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  // resolveCategories method removed

  async search(searchQuery: SearchBusinessDto) {
    const {
      queryText,
      category,
      location: locationQuery,
      page = 1,
      limit = 10,
      sortBy,
    } = searchQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.businessRepository
      .createQueryBuilder('business')
      .leftJoinAndSelect('business.location', 'location')
      .leftJoinAndSelect('business.sector', 'sector')
      .leftJoinAndSelect('business.category', 'category')
      .leftJoinAndSelect('business.subCategory', 'subCategory');

    if (queryText) {
      queryBuilder.where(
        '(business.businessName ILIKE :query OR business.shortDescription ILIKE :query OR business.about ILIKE :query)',
        { query: `%${queryText}%` },
      );
    }

    if (category) {
      const condition = 'category.name ILIKE :category';
      const params = { category: `%${category}%` };
      if (queryText) {
        queryBuilder.andWhere(condition, params);
      } else {
        queryBuilder.where(condition, params);
      }
    }

    if (locationQuery) {
      const condition =
        '(location.addressLine1 ILIKE :location OR location.city ILIKE :location OR location.postcode ILIKE :location)';
      const params = { location: `%${locationQuery}%` };
      if (queryText || category) {
        queryBuilder.andWhere(condition, params);
      } else {
        queryBuilder.where(condition, params);
      }
    }

    // Sorting
    if (sortBy === 'newest') {
      queryBuilder.orderBy('business.created_at', 'DESC');
    } else if (sortBy === 'oldest') {
      queryBuilder.orderBy('business.created_at', 'ASC');
    } else if (sortBy === 'name') {
      queryBuilder.orderBy('business.businessName', 'ASC');
    } else {
      queryBuilder.orderBy('business.created_at', 'DESC'); // Default to newest
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
