import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, ILike } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Business } from '../listings/entities/listing.entity';
import { ListingType } from '../listings/listing.enum';
import { User } from '../users/entities/user.entity';
import {
  BundledServiceDto,
  ConfigurableAddonDto,
} from './dto/create-service.dto';
import { BundledService } from './entities/bundled-service.entity';
import { ConfigurableAddon } from './entities/configurable-addon.entity';
import {
  SpareCapacityOffer,
  SpareCapacityStatus,
} from './entities/spare-capacity-offer.entity';
import { PublishSpareCapacityDto } from './dto/publish-spare-capacity.dto';
import { ServiceBooking } from '../booking/entities/service-booking.entity';
import { ActivitiesService } from '../activities/activities.service';
import { SearchServiceDto } from './dto/search-service.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
  ActionType,
  CapabilityService,
} from '../capability/capability.service';
import { ServiceSearchDto } from './dto/service-search.dto';
import { PageDto } from '../../common/dto/page.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { UserRole } from '../../common/role.enum';
import { resolveBusinessTaxonomy } from '../../common/taxonomy/business-taxonomy';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BundledService)
    private readonly bundledServiceRepository: Repository<BundledService>,
    @InjectRepository(ConfigurableAddon)
    private readonly configurableAddonRepository: Repository<ConfigurableAddon>,
    @InjectRepository(SpareCapacityOffer)
    private readonly spareCapacityOfferRepository: Repository<SpareCapacityOffer>,
    private readonly activitiesService: ActivitiesService,
    @Inject(forwardRef(() => CapabilityService))
    private readonly capabilityService: CapabilityService,
  ) {}

  async countForUser(userId: string): Promise<number> {
    const businesses = await this.businessRepository.find({
      where: { user: { id: userId } },
    });
    if (!businesses.length) {
      return 0;
    }
    const businessIds = businesses.map((b) => b.id);
    return this.serviceRepository.count({
      where: { businessId: In(businessIds) },
    });
  }

  async create(
    createServiceDto: CreateServiceDto,
    userId: string,
  ): Promise<Service> {
    const currentServiceCount = await this.serviceRepository.count({
      where: { business: { user: { id: userId } } },
    });

    await this.capabilityService.checkPermission(
      userId,
      ActionType.CREATE_SERVICE,
      {
        currentCount: currentServiceCount,
      },
    );

    const business = await this.businessRepository.findOne({
      where: { id: createServiceDto.businessId },
      relations: ['user', 'sector', 'category', 'subCategory'],
    });

    if (!business) {
      throw new NotFoundException(
        `Business with ID ${createServiceDto.businessId} not found`,
      );
    }

    if (business.user.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to create a service for this business',
      );
    }

    const existingService = await this.serviceRepository.findOne({
      where: {
        businessId: createServiceDto.businessId,
        name: createServiceDto.name,
      },
    });

    if (existingService) {
      throw new ConflictException(
        `A service with the name "${createServiceDto.name}" already exists for this business`,
      );
    }

    if (!business.listingType.includes(ListingType.SERVICE)) {
      business.listingType.push(ListingType.SERVICE);
      await this.businessRepository.save(business);
    }

    const { bundledServices, configurableAddons, ...serviceData } =
      createServiceDto;
    delete (serviceData as Record<string, unknown>).adminDisabled;

    // Classification is owned by the MCOM Central business profile. Always
    // prefer the synced business taxonomy over whatever the client sent.
    const taxonomy = resolveBusinessTaxonomy(business);
    if (taxonomy.sector) serviceData.sector = taxonomy.sector;
    if (taxonomy.category) serviceData.category = taxonomy.category;
    if (taxonomy.subCategory) serviceData.subcategory = taxonomy.subCategory;

    if (!serviceData.sector) {
      throw new BadRequestException(
        'Your MCOM Central business profile needs a sector before you can add a service.',
      );
    }

    const hasServiceImage =
      (serviceData.images?.length ?? 0) > 0 ||
      (serviceData.media ?? []).some(
        (url) =>
          typeof url === 'string' &&
          !/\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i.test(url),
      );

    if (!hasServiceImage) {
      throw new BadRequestException(
        'At least one service image is required to create a service.',
      );
    }

    // Map frontend fields to backend
    if (serviceData.images || serviceData.media) {
      serviceData.media = Array.from(
        new Set([...(serviceData.images || []), ...(serviceData.media || [])]),
      );
    }
    if (serviceData.shortDesc && !serviceData.shortDescription) {
      serviceData.shortDescription = serviceData.shortDesc;
    }
    if (serviceData.fullDesc && !serviceData.description) {
      serviceData.description = serviceData.fullDesc;
    }

    const service = this.serviceRepository.create({
      ...serviceData,
      businessId: business.id,
    });

    const savedService = await this.serviceRepository.save(service);

    if (bundledServices) {
      const newBundledServices = bundledServices.map((dto) =>
        this.bundledServiceRepository.create({
          ...dto,
          serviceId: savedService.id,
        }),
      );
      await this.bundledServiceRepository.save(newBundledServices);
      savedService.bundledServices = newBundledServices;
    }

    if (configurableAddons) {
      const newConfigurableAddons = configurableAddons.map((dto) =>
        this.configurableAddonRepository.create({
          ...dto,
          serviceId: savedService.id,
        }),
      );
      await this.configurableAddonRepository.save(newConfigurableAddons);
      savedService.configurableAddons = newConfigurableAddons;
    }

    await this.activitiesService.create(
      business.user,
      'created',
      'service',
      savedService.name,
    );

    return savedService;
  }

  async findAllForBusiness(
    businessId: string,
    paginationDto: PaginationDto,
    user?: User,
  ): Promise<{
    data: Service[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }

    const isOwner = !!user && business.user?.id === user.id;
    const isAdmin = user?.role === UserRole.ADMIN;
    const canSeeAll = isOwner || isAdmin;

    const where: Record<string, unknown> = { businessId };
    if (!canSeeAll) {
      where.status = 'published';
      where.isActive = true;
      where.adminDisabled = false;
    }

    const [data, total] = await this.serviceRepository.findAndCount({
      where,
      relations: ['bundledServices', 'configurableAddons'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findAllForUser(userId: string): Promise<Service[]> {
    const businesses = await this.businessRepository.find({
      where: { user: { id: userId } },
    });
    const businessIds = businesses.map((b) => b.id);
    return this.serviceRepository.find({
      where: { businessId: In(businessIds) },
      relations: ['bundledServices', 'configurableAddons'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['bundledServices', 'configurableAddons', 'business'],
    });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  /**
   * Public-facing lookup. Draft or paused services are only returned to the
   * business that owns them (or an admin).
   */
  async findOneForViewer(id: string, user?: User): Promise<Service | null> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: [
        'bundledServices',
        'configurableAddons',
        'business',
        'business.user',
      ],
    });

    if (!service) {
      return null;
    }

    const isOwner = !!user && service.business?.user?.id === user.id;
    const isAdmin = user?.role === UserRole.ADMIN;
    const isPubliclyVisible =
      service.status === 'published' &&
      service.isActive === true &&
      !service.adminDisabled;

    if (isOwner || isAdmin || isPubliclyVisible) {
      return service;
    }

    // An admin-disabled service stays visible to the customer who already
    // booked it so they can still access their booking details.
    if (service.adminDisabled && user) {
      const hasBooked = await this.serviceRepository.manager
        .getRepository(ServiceBooking)
        .createQueryBuilder('booking')
        .where('booking.service = :serviceId', { serviceId: id })
        .andWhere('booking.user = :userId', { userId: user.id })
        .getExists();

      if (hasBooked) {
        return service;
      }
    }

    return null;
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    userId: string,
  ): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: [
        'business',
        'business.user',
        'business.sector',
        'business.category',
        'business.subCategory',
      ],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    if (service.business.user.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this service',
      );
    }

    if (
      updateServiceDto.businessId &&
      updateServiceDto.businessId !== service.businessId
    ) {
      throw new ForbiddenException('Cannot change the business of a service');
    }

    const { bundledServices, configurableAddons, ...serviceData } =
      updateServiceDto;
    // Admin moderation is not writable by merchants, even if they send it.
    delete (serviceData as Record<string, unknown>).adminDisabled;

    // Keep the service aligned with the MCOM Central business classification.
    const taxonomy = resolveBusinessTaxonomy(service.business);
    if (taxonomy.sector) serviceData.sector = taxonomy.sector;
    if (taxonomy.category) serviceData.category = taxonomy.category;
    if (taxonomy.subCategory) serviceData.subcategory = taxonomy.subCategory;

    // Map frontend fields to backend
    if (serviceData.images || serviceData.media) {
      serviceData.media = Array.from(
        new Set([...(serviceData.images || []), ...(serviceData.media || [])]),
      );
    }
    if (serviceData.shortDesc && !serviceData.shortDescription) {
      serviceData.shortDescription = serviceData.shortDesc;
    }
    if (serviceData.fullDesc && !serviceData.description) {
      serviceData.description = serviceData.fullDesc;
    }

    Object.assign(service, serviceData);
    await this.serviceRepository.save(service);

    const updatedService = await this.serviceRepository.findOne({
      where: { id },
      relations: ['bundledServices', 'configurableAddons', 'business'],
    });

    if (bundledServices) {
      await this.updateBundledServices(updatedService, bundledServices);
    }

    if (configurableAddons) {
      await this.updateConfigurableAddons(updatedService, configurableAddons);
    }

    await this.activitiesService.create(
      service.business.user,
      'updated',
      'service',
      updatedService.name,
    );

    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['business', 'business.user'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    if (service.business.user.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this service',
      );
    }
    await this.serviceRepository.softDelete(id);
    await this.activitiesService.create(
      service.business.user,
      'deleted',
      'service',
      service.name,
    );
  }

  async addBundledService(
    serviceId: string,
    dto: BundledServiceDto,
    userId: string,
  ): Promise<BundledService> {
    const service = await this.findOne(serviceId);
    if (service.business.user.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to modify this service',
      );
    }
    const bundledService = this.bundledServiceRepository.create({
      ...dto,
      serviceId,
    });
    return this.bundledServiceRepository.save(bundledService);
  }

  async removeBundledService(
    serviceId: string,
    bundledServiceId: string,
    userId: string,
  ): Promise<void> {
    const service = await this.findOne(serviceId);
    if (service.business.user.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to modify this service',
      );
    }
    const result = await this.bundledServiceRepository.softDelete({
      id: bundledServiceId,
      serviceId,
    });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Bundled service with ID ${bundledServiceId} not found`,
      );
    }
  }

  async addConfigurableAddon(
    serviceId: string,
    dto: ConfigurableAddonDto,
    userId: string,
  ): Promise<ConfigurableAddon> {
    const service = await this.findOne(serviceId);
    if (service.business.user.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to modify this service',
      );
    }
    const addon = this.configurableAddonRepository.create({
      ...dto,
      serviceId,
    });
    return this.configurableAddonRepository.save(addon);
  }

  async removeConfigurableAddon(
    serviceId: string,
    addonId: string,
    userId: string,
  ): Promise<void> {
    const service = await this.findOne(serviceId);
    if (service.business.user.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to modify this service',
      );
    }
    const result = await this.configurableAddonRepository.softDelete({
      id: addonId,
      serviceId,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Addon with ID ${addonId} not found`);
    }
  }

  private async updateBundledServices(
    service: Service,
    dtos: BundledServiceDto[],
  ) {
    const existingBundledServices = await this.bundledServiceRepository.find({
      where: { serviceId: service.id },
    });
    const dtosToCreate = dtos.filter(
      (dto) =>
        !existingBundledServices.some((existing) => existing.name === dto.name),
    );
    const servicesToDelete = existingBundledServices.filter(
      (existing) => !dtos.some((dto) => dto.name === existing.name),
    );

    if (dtosToCreate.length > 0) {
      const newBundledServices = dtosToCreate.map((dto) =>
        this.bundledServiceRepository.create({
          ...dto,
          serviceId: service.id,
        }),
      );
      await this.bundledServiceRepository.save(newBundledServices);
    }

    if (servicesToDelete.length > 0) {
      await this.bundledServiceRepository.softDelete(
        servicesToDelete.map((s) => s.id),
      );
    }
  }

  private async updateConfigurableAddons(
    service: Service,
    dtos: ConfigurableAddonDto[],
  ) {
    const existingAddons = await this.configurableAddonRepository.find({
      where: { serviceId: service.id },
    });
    const dtosToCreate = dtos.filter(
      (dto) => !existingAddons.some((existing) => existing.name === dto.name),
    );
    const addonsToDelete = existingAddons.filter(
      (existing) => !dtos.some((dto) => dto.name === existing.name),
    );

    if (dtosToCreate.length > 0) {
      const newConfigurableAddons = dtosToCreate.map((dto) =>
        this.configurableAddonRepository.create({
          ...dto,
          serviceId: service.id,
        }),
      );
      await this.configurableAddonRepository.save(newConfigurableAddons);
    }

    if (addonsToDelete.length > 0) {
      await this.configurableAddonRepository.softDelete(
        addonsToDelete.map((a) => a.id),
      );
    }
  }

  async search(searchServiceDto: SearchServiceDto): Promise<Service[]> {
    const { term } = searchServiceDto;
    return this.serviceRepository.find({
      where: [
        {
          name: ILike(`%${term}%`),
          status: 'published',
          isActive: true,
        },
        {
          description: ILike(`%${term}%`),
          status: 'published',
          isActive: true,
        },
      ],
      relations: ['bundledServices', 'configurableAddons', 'business'],
    });
  }

  async findAllPublic(searchDto: ServiceSearchDto): Promise<PageDto<Service>> {
    const { page, limit, search, minPrice, maxPrice } = searchDto;

    const queryBuilder = this.serviceRepository.createQueryBuilder('service');

    queryBuilder
      .leftJoinAndSelect('service.business', 'business')
      .where('service.isActive = :isActive', { isActive: true })
      .andWhere('service.status = :status', { status: 'published' })
      .andWhere('service.adminDisabled = :adminDisabled', {
        adminDisabled: false,
      });

    if (search) {
      queryBuilder.andWhere(
        '(service.name ILIKE :search OR service.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere(
        '(service.fixedPrice >= :minPrice OR service.basePrice >= :minPrice)',
        { minPrice },
      );
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere(
        '(service.fixedPrice <= :maxPrice OR service.basePrice <= :maxPrice)',
        { maxPrice },
      );
    }

    queryBuilder
      .orderBy('service.created_at', 'DESC')
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

  async publishSpareCapacity(
    dto: PublishSpareCapacityDto,
    userId: string,
  ): Promise<SpareCapacityOffer> {
    const {
      serviceId,
      slots,
      discountPercent,
      headline,
      note,
      expiresAt,
      isLiveFeed,
    } = dto;

    const service = await this.serviceRepository.findOne({
      where: { id: serviceId },
      relations: ['business', 'business.user'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    if (service.business.user.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to publish spare capacity for this service',
      );
    }

    // Compute the discounted price from the service's pricing
    const basePrice = Number(
      service.fixedPrice ?? service.pricePerHour ?? service.basePrice ?? 0,
    );
    const discountedPrice =
      discountPercent > 0
        ? parseFloat((basePrice * (1 - discountPercent / 100)).toFixed(2))
        : basePrice;

    // Default expiry: end of today (23:59:59) if not provided
    const offerExpiry = expiresAt
      ? new Date(expiresAt)
      : (() => {
          const endOfDay = new Date();
          endOfDay.setHours(23, 59, 59, 999);
          return endOfDay;
        })();

    // Deactivate any existing active spare capacity offers for this service
    await this.spareCapacityOfferRepository.update(
      { serviceId, status: SpareCapacityStatus.ACTIVE },
      { status: SpareCapacityStatus.CANCELLED },
    );

    // Create the new offer record
    const offer = this.spareCapacityOfferRepository.create({
      serviceId,
      headline,
      note,
      discountPercent,
      discountedPrice,
      originalPrice: basePrice,
      slots,
      totalSlots: slots.length,
      bookedSlots: 0,
      expiresAt: offerExpiry,
      status: SpareCapacityStatus.ACTIVE,
      isLiveFeed: isLiveFeed ?? true,
      boroughTag: service.business?.location?.city ?? null,
    });

    const savedOffer = await this.spareCapacityOfferRepository.save(offer);

    await this.activitiesService.create(
      service.business.user,
      'published spare capacity',
      'service',
      service.name,
    );

    return savedOffer;
  }
}
