import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from './entities/listing.entity';
import { Sector } from '../taxonomy/entities/sector.entity';
import { TaxonomyCategory } from '../taxonomy/entities/taxonomy-category.entity';
import { TaxonomySubcategory } from '../taxonomy/entities/taxonomy-subcategory.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { BusinessStatus, ListingType } from './listing.enum';
import { CreateBusinessDto, UpdateBusinessDto } from './dto/listings.dto';
import { User } from '../users/entities/user.entity';
import { SearchBusinessDto } from './dto/listings.dto';
import { ActivitiesService } from '../activities/activities.service';
import { PromotionService } from '../promotion/promotion.service';
import { Promotion } from '../promotion/entities/promotion.entity';
import { Product } from '../product/entities/product.entity';
import { PromotionScope } from '../promotion/promotion.enum';
import { ListingPublicDto } from './dto/listing-public.dto';
import { OnboardingDeciderService } from '../localmall/onboarding-decider.service';
import { ActivatedRegion } from '../localmall/entities/activated-region.entity';
import {
  CapabilityService,
  ActionType,
} from '../capability/capability.service';
import { ActivityTimerService } from '../activity-timer/activity-timer.service';

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly activitiesService: ActivitiesService,
    private readonly promotionService: PromotionService,
    @Inject(forwardRef(() => CapabilityService))
    private readonly capabilityService: CapabilityService,
    private readonly activityTimerService: ActivityTimerService,
    private readonly onboardingDeciderService: OnboardingDeciderService,
  ) {}

  async create(
    createBusinessDto: CreateBusinessDto,
    userId: string,
  ): Promise<Business> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Check Capability for Listing - Handled by CapabilitiesGuard on Controller
    // const currentListingCount = await this.businessRepository.count({ where: { user: { id: userId } } });
    // await this.capabilityService.checkPermission(userId, ActionType.CREATE_LISTING, { currentCount: currentListingCount });

    if (createBusinessDto.listingType.includes(ListingType.PRODUCT)) {
      await this.capabilityService.checkPermission(
        userId,
        ActionType.CAN_SELL_PRODUCTS,
      );
    }

    if (createBusinessDto.listingType.includes(ListingType.SERVICE)) {
      await this.capabilityService.checkPermission(
        userId,
        ActionType.CAN_SELL_SERVICES,
      );
    }

    if (
      createBusinessDto.listingType.includes(ListingType.PRODUCT) &&
      !createBusinessDto.productSellerProfile
    ) {
      throw new BadRequestException(
        'Product seller profile is required for product listings.',
      );
    }
    if (
      createBusinessDto.listingType.includes(ListingType.SERVICE) &&
      !createBusinessDto.serviceProviderProfile
    ) {
      throw new BadRequestException(
        'Service provider profile is required for service listings.',
      );
    }

    if (
      createBusinessDto.listingType.includes(ListingType.PRODUCT) &&
      !createBusinessDto.location
    ) {
      throw new BadRequestException(
        'Location is required for businesses that sell products.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { sectorId, categoryId, subCategoryId, ...businessData } =
        createBusinessDto;

      const isUuid = (val: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          val || '',
        );

      if (!sectorId || !isUuid(sectorId)) {
        throw new BadRequestException('Invalid Sector ID');
      }
      if (!categoryId || !isUuid(categoryId)) {
        throw new BadRequestException('Invalid Category ID');
      }
      if (!subCategoryId || !isUuid(subCategoryId)) {
        throw new BadRequestException('Invalid SubCategory ID');
      }

      // Validate Taxonomy Hierarchy
      const sector = await this.sectorRepository.findOne({
        where: { id: sectorId },
      });
      if (!sector) {
        throw new BadRequestException('Invalid Sector ID');
      }

      const category = await this.taxonomyCategoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        throw new BadRequestException('Invalid Category ID');
      }
      if (category.sectorId !== sectorId) {
        throw new BadRequestException(
          'Selected Category does not belong to the selected Sector',
        );
      }

      const subCategory = await this.taxonomySubcategoryRepository.findOne({
        where: { id: subCategoryId },
      });
      if (!subCategory) {
        throw new BadRequestException('Invalid SubCategory ID');
      }
      if (subCategory.categoryId !== categoryId) {
        throw new BadRequestException(
          'Selected SubCategory does not belong to the selected Category',
        );
      }

      let localMallId: string | undefined = undefined;
      let resolvedArea: string | undefined = undefined;
      if (createBusinessDto.location && createBusinessDto.location.postcode) {
        try {
          const deciderResult =
            await this.onboardingDeciderService.checkLocation(
              createBusinessDto.location.postcode,
            );
          if (deciderResult) {
            (businessData.location as any).latitude = deciderResult.latitude;
            (businessData.location as any).longitude = deciderResult.longitude;
            (businessData.location as any).resolvedArea =
              deciderResult.resolvedArea;
            resolvedArea = deciderResult.resolvedArea;
            localMallId = deciderResult.localMallId;
          }
        } catch (e) {
          console.error('Failed resolving location details:', e);
        }
      }

      const business = this.businessRepository.create({
        ...businessData,
        isClaimed: true, // New businesses are claimed by default
        user,
        status: BusinessStatus.DRAFT,
        sector,
        category,
        subCategory,
        localMallId,
      });

      const savedBusiness = await queryRunner.manager.save(business);

      // Update ActivatedRegion active status dynamically based on business counts in the local mall
      if (localMallId && resolvedArea) {
        try {
          const count = await queryRunner.manager.count(Business, {
            where: { localMallId },
          });
          const shouldBeActive = count > 1;
          await queryRunner.manager.update(
            ActivatedRegion,
            { name: resolvedArea },
            { isActive: shouldBeActive },
          );
        } catch (e) {
          console.error('Failed dynamically activating region:', e);
        }
      }
      await this.activitiesService.create(
        user,
        'created',
        'listing',
        savedBusiness.businessName,
      );

      await this.activityTimerService.completeTaskByKey(
        userId,
        'createdBusiness',
        true,
      );

      await queryRunner.commitTransaction();
      return savedBusiness;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err instanceof BadRequestException
        ? err
        : new BadRequestException(`Failed to create listing: ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllForUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.businessRepository.findAndCount({
      where: { user: { id: userId } },
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
      promotion: business.user.promotion,
    };

    if (user && business.products) {
      const userPromotions = await this.promotionService.findUserPromotions(
        user.id,
      );

      for (const product of business.products) {
        let totalPoints = 0;
        for (const promotion of userPromotions) {
          if (this.isProductQualified(product, promotion, business)) {
            totalPoints += promotion.points || 0;
          }
        }
        (product as any).points = totalPoints;
      }
    }

    return response;
  }

  private isProductQualified(
    product: Product,
    promotion: Promotion,
    business: Business,
  ): boolean {
    if (
      promotion.excludedProducts &&
      promotion.excludedProducts.some(
        (excludedProduct) => excludedProduct.id === product.id,
      )
    ) {
      return false;
    }

    switch (promotion.promotionScope) {
      case PromotionScope.ALL_LISTINGS:
        return (
          business.user?.id &&
          promotion.user?.id &&
          business.user.id === promotion.user.id
        );
      case PromotionScope.SPECIFIC_LISTINGS:
        return (
          promotion.businesses &&
          promotion.businesses.some(
            (promoBusiness) => promoBusiness.id === business.id,
          )
        );
      case PromotionScope.ALL_PRODUCTS:
        return (
          business.user?.id &&
          promotion.user?.id &&
          business.user.id === promotion.user.id
        );
      case PromotionScope.SPECIFIC_PRODUCTS:
        return (
          promotion.includedProducts &&
          promotion.includedProducts.some(
            (includedProduct) => includedProduct.id === product.id,
          )
        );
      default:
        return false;
    }
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

  async remove(id: string, userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the business and ALL its relations within the transaction
      const business = await queryRunner.manager.findOne(Business, {
        where: { id, user: { id: userId } },
        relations: [
          'location',
          'socialLinks',
          'businessHours',
          'specialDays',
          'productSellerProfile',
          'productSellerProfile.storefrontLinks',
          'serviceProviderProfile',
          'serviceProviderProfile.certifications',
          'products',
          'campaigns',
        ],
      });

      if (!business) {
        throw new ForbiddenException(
          'Business not found or you do not have permission to delete this.',
        );
      }

      // Manually remove all related entities to ensure correct order
      // and bypass any issues with the ORM's automatic cascade.
      if (business.productSellerProfile?.storefrontLinks?.length) {
        await queryRunner.manager.remove(
          business.productSellerProfile.storefrontLinks,
        );
      }
      if (business.serviceProviderProfile?.certifications?.length) {
        await queryRunner.manager.remove(
          business.serviceProviderProfile.certifications,
        );
      }
      if (business.productSellerProfile) {
        await queryRunner.manager.remove(business.productSellerProfile);
      }
      if (business.serviceProviderProfile) {
        await queryRunner.manager.remove(business.serviceProviderProfile);
      }
      if (business.location) {
        await queryRunner.manager.remove(business.location);
      }
      if (business.socialLinks?.length) {
        await queryRunner.manager.remove(business.socialLinks);
      }
      if (business.businessHours?.length) {
        await queryRunner.manager.remove(business.businessHours);
      }
      if (business.specialDays?.length) {
        await queryRunner.manager.remove(business.specialDays);
      }
      if (business.products?.length) {
        await queryRunner.manager.remove(business.products);
      }
      if (business.campaigns?.length) {
        await queryRunner.manager.remove(business.campaigns);
      }

      // Finally, remove the business itself
      await queryRunner.manager.remove(business);
      await this.activitiesService.create(
        business.user,
        'deleted',
        'listing',
        business.businessName,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      // Re-throw the original error to be handled by Nest's exception filter
      throw err;
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
