import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { Partnership } from '../partnership/entities/partnership.entity';
import { PartnershipRequest } from '../partnership/entities/partnership-request.entity';
import { PartnershipRequestStatus } from '../partnership/partnership.enum';
import { ActivitiesService } from '../activities/activities.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PromotionService } from '../promotion/promotion.service';
import {
  CapabilityService,
  ActionType,
} from '../capability/capability.service';
import { ProductSearchDto } from './dto/product-search.dto';
import { PageDto } from '../../common/dto/page.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { v4 as uuidv4 } from 'uuid';
import { ActivityTimerService } from '../activity-timer/activity-timer.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Partnership)
    private partnershipRepository: Repository<Partnership>,
    @InjectRepository(PartnershipRequest)
    private partnershipRequestRepository: Repository<PartnershipRequest>,
    private readonly activitiesService: ActivitiesService,
    private readonly activityTimerService: ActivityTimerService,
    @Inject(forwardRef(() => PromotionService))
    private readonly promotionService: PromotionService,
    @Inject(forwardRef(() => CapabilityService))
    private readonly capabilityService: CapabilityService,
  ) {}

  async countForUser(userId: string): Promise<number> {
    return this.productRepository.count({
      where: { business: { user: { id: userId } } },
    });
  }

  async create(createProductDto: CreateProductDto, business: Business) {
    const userId = business.user.id;
    const currentProductCount = await this.productRepository.count({
      where: { business: { user: { id: userId } } },
    });

    await this.capabilityService.checkPermission(
      userId,
      ActionType.CREATE_PRODUCT,
      {
        currentCount: currentProductCount,
      },
    );

    const { serviceProviderId, ...restOfDto } = createProductDto;
    let serviceProvider: User | undefined;

    if (serviceProviderId) {
      serviceProvider = await this.userRepository.findOne({
        where: { id: serviceProviderId },
      });
      if (!serviceProvider) {
        throw new NotFoundException('Service provider not found');
      }

      const partnershipRequest =
        await this.partnershipRequestRepository.findOne({
          where: {
            requestingUser: { id: business.user.id },
            serviceOwner: { id: serviceProviderId },
            status: PartnershipRequestStatus.ACCEPTED,
          },
        });

      if (!partnershipRequest) {
        throw new ForbiddenException(
          'You do not have an accepted partnership with this service provider.',
        );
      }
    }

    if (restOfDto.variations && restOfDto.variations.length > 0) {
      restOfDto.variations = restOfDto.variations.map((v) => ({
        ...v,
        id: v.id || uuidv4(),
      }));
    }

    if (restOfDto.productStatus === 'publish') {
      restOfDto.productStatus = 'published';
    }

    // Map frontend-style fields to backend fields
    if (restOfDto.productName && !restOfDto.title) {
      restOfDto.title = restOfDto.productName;
    }
    if (restOfDto.shortDesc && !restOfDto.shortDescription) {
      restOfDto.shortDescription = restOfDto.shortDesc;
    }
    if (restOfDto.fullDesc && !restOfDto.description) {
      restOfDto.description = restOfDto.fullDesc;
    }
    if (
      restOfDto.regular_price !== undefined &&
      restOfDto.price === undefined
    ) {
      restOfDto.price = restOfDto.regular_price;
    }
    if (
      restOfDto.sale_price !== undefined &&
      restOfDto.salePrice === undefined
    ) {
      restOfDto.salePrice = restOfDto.sale_price;
    }
    if (restOfDto.quantity !== undefined && restOfDto.stock === undefined) {
      restOfDto.stock = restOfDto.quantity;
    }
    if (restOfDto.images || restOfDto.videos || restOfDto.media) {
      restOfDto.media = [
        ...(restOfDto.images || []),
        ...(restOfDto.videos || []),
        ...(restOfDto.media || []),
      ];
    }

    const product = this.productRepository.create({
      ...restOfDto,
      business,
      serviceProvider,
    });

    const savedProduct = await this.productRepository.save(product);
    await this.activitiesService.create(
      business.user,
      'created',
      'product',
      savedProduct.title,
    );

    await this.activityTimerService.completeTaskByKey(
      business.user.id,
      'createdProductOrService',
    );

    return savedProduct;
  }

  async findAllByUser(userId: string) {
    const products = await this.productRepository.find({
      where: { business: { user: { id: userId } } },
      relations: ['business'],
    });
    return products;
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['business', 'business.user'],
    });
    if (!product) {
      return null;
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    const product = await this.findOne(id);
    if (!product) {
      return null;
    }
    if (product.business.user.id !== userId) {
      throw new UnauthorizedException();
    }

    const { serviceProviderId, ...restOfDto } = updateProductDto;

    if (restOfDto.variations && restOfDto.variations.length > 0) {
      restOfDto.variations = restOfDto.variations.map((v) => ({
        ...v,
        id: v.id || uuidv4(),
      }));
    }

    if (restOfDto.productStatus === 'publish') {
      restOfDto.productStatus = 'published';
    }

    // Map frontend-style fields to backend fields
    if (restOfDto.productName && !restOfDto.title) {
      restOfDto.title = restOfDto.productName;
    }
    if (restOfDto.shortDesc && !restOfDto.shortDescription) {
      restOfDto.shortDescription = restOfDto.shortDesc;
    }
    if (restOfDto.fullDesc && !restOfDto.description) {
      restOfDto.description = restOfDto.fullDesc;
    }
    if (
      restOfDto.regular_price !== undefined &&
      restOfDto.price === undefined
    ) {
      restOfDto.price = restOfDto.regular_price;
    }
    if (
      restOfDto.sale_price !== undefined &&
      restOfDto.salePrice === undefined
    ) {
      restOfDto.salePrice = restOfDto.sale_price;
    }
    if (restOfDto.quantity !== undefined && restOfDto.stock === undefined) {
      restOfDto.stock = restOfDto.quantity;
    }
    if (restOfDto.images || restOfDto.videos || restOfDto.media) {
      restOfDto.media = [
        ...(restOfDto.images || []),
        ...(restOfDto.videos || []),
        ...(restOfDto.media || []),
      ];
    }

    Object.assign(product, restOfDto);

    if (updateProductDto.hasOwnProperty('serviceProviderId')) {
      if (serviceProviderId === null) {
        product.serviceProvider = null;
      } else {
        const serviceProvider = await this.userRepository.findOne({
          where: { id: serviceProviderId },
        });
        if (!serviceProvider) {
          throw new NotFoundException('Service provider not found');
        }

        const partnershipRequest =
          await this.partnershipRequestRepository.findOne({
            where: {
              requestingUser: { id: product.business.user.id },
              serviceOwner: { id: serviceProviderId },
              status: PartnershipRequestStatus.ACCEPTED,
            },
          });

        if (!partnershipRequest) {
          throw new ForbiddenException(
            'You do not have an accepted partnership with this service provider.',
          );
        }
        product.serviceProvider = serviceProvider;
      }
    }

    const savedProduct = await this.productRepository.save(product);
    await this.activitiesService.create(
      product.business.user,
      'updated',
      'product',
      savedProduct.title,
    );
    return savedProduct;
  }

  async remove(id: string, userId: string) {
    const product = await this.findOne(id);
    if (!product) {
      return null;
    }
    if (product.business.user.id !== userId) {
      throw new UnauthorizedException();
    }
    await this.productRepository.remove(product);
    await this.activitiesService.create(
      product.business.user,
      'deleted',
      'product',
      product.title,
    );
    return { message: 'Product removed successfully' };
  }

  async findAllForBusiness(
    businessId: string,
    paginationDto: PaginationDto,
    user?: User,
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.productRepository.findAndCount({
      where: { business: { id: businessId } },
      relations: ['business', 'business.user'],
      skip: (page - 1) * limit,
      take: limit,
    });

    if (user) {
      const userPromotions = await this.promotionService.findUserPromotions(
        user.id,
      );

      for (const product of data) {
        let totalPoints = 0;
        for (const promotion of userPromotions) {
          if (
            this.promotionService.isProductQualified(
              product,
              promotion,
              product.business,
            )
          ) {
            totalPoints += promotion.bonusPoints || 0;
          }
        }
        (product as any).points = totalPoints;
      }
    }

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findAllPublic(searchDto: ProductSearchDto): Promise<PageDto<Product>> {
    const { page, limit, search, minPrice, maxPrice, category } = searchDto;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    queryBuilder
      .leftJoinAndSelect('product.business', 'business')
      .where('product.productStatus = :status', { status: 'published' })
      .andWhere('product.visibility = :visibility', { visibility: 'public' })
      .andWhere(
        '(product.enableStockManagement = :disableStockManagement OR product.stock > :minStock OR (product.variations IS NOT NULL AND jsonb_path_exists(product.variations, :jsonPath)))',
        {
          disableStockManagement: false,
          minStock: 0,
          jsonPath: '$[*] ? (@.stock > 0)',
        },
      );

    if (search) {
      queryBuilder.andWhere(
        '(product.title ILIKE :search OR product.description ILIKE :search OR product.shortDescription ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    queryBuilder
      .orderBy('product.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      totalItems,
      itemCount: items.length,
      pageOptionsDto: searchDto,
    });

    return new PageDto(items, pageMetaDto);
  }

  /**
   * Calculates the final price of a product based on selected variants or variations.
   * Enforces strict matching if variations are enabled.
   * @param product The product entity.
   * @param selectedOptions A map of variant names to selected option names. e.g., { "Color": "Blue", "Size": "XL" }
   * @returns The calculated price.
   * @throws BadRequestException if variant selection is invalid when required.
   */
  calculatePrice(
    product: Product,
    selectedOptions: Record<string, string>,
  ): number {
    const hasVariations = product.variations && product.variations.length > 0;
    const isVariantPricingEnabled = product.useVariantPricing !== false;

    // 1. Strict Check: If product has variations, a valid selection is REQUIRED.
    if (hasVariations && isVariantPricingEnabled) {
      if (!selectedOptions || Object.keys(selectedOptions).length === 0) {
        throw new BadRequestException('Please select product options.');
      }

      const variation = product.variations.find((v) => {
        const variantKeys = Object.keys(v.combination);
        const selectedKeys = Object.keys(selectedOptions);

        // Strict: Number of options must match (prevents partial matches)
        if (variantKeys.length !== selectedKeys.length) return false;

        // Strict: All key-values must match exactly
        return variantKeys.every(
          (key) => v.combination[key] === selectedOptions[key],
        );
      });

      if (!variation) {
        throw new BadRequestException(
          'Selected product options are unavailable or invalid.',
        );
      }

      // Variation price is absolute
      return variation.salePrice !== undefined && variation.salePrice !== null
        ? variation.salePrice
        : variation.price;
    }

    // 2. Fallback: Base Product Price (Only if no variations exist or variant pricing is disabled)
    // Legacy support for older variantConfig system (if needed)
    if (!selectedOptions || Object.keys(selectedOptions).length === 0) {
      return product.salePrice !== undefined && product.salePrice !== null
        ? product.salePrice
        : product.price;
    }

    let finalPrice =
      product.salePrice !== undefined && product.salePrice !== null
        ? product.salePrice
        : product.price;

    if (product.variantConfig && product.variantConfig.length > 0) {
      for (const config of product.variantConfig) {
        const selectedValue = selectedOptions[config.name];
        if (selectedValue) {
          const option = config.options.find((o) => o.name === selectedValue);
          if (option) {
            finalPrice += Number(option.priceModifier);
          }
        }
      }
    }

    return finalPrice;
  }
}
