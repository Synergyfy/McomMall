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
import {
  applyBusinessLocationFilter,
  applyBusinessNearOrder,
} from '../geography/location-filter.util';
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
import {
  ApprovalStatus,
  resubmitForApproval,
  stripModerationFields,
} from '../../common/moderation/catalog-approval';
import {
  CustomerAction,
  PricingModel,
  PricingType,
  ServiceDeliveryOption,
} from './service.enum';

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

  async countFeaturedForUser(
    userId: string,
    excludeServiceId?: string,
  ): Promise<number> {
    const query = this.serviceRepository
      .createQueryBuilder('service')
      .innerJoin('service.business', 'business')
      .where('business.user = :userId', { userId })
      .andWhere('service.isFeatured = :featured', { featured: true });

    if (excludeServiceId) {
      query.andWhere('service.id != :excludeServiceId', { excludeServiceId });
    }

    return query.getCount();
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
      relations: ['user', 'sector', 'category', 'subCategory', 'location'],
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
    stripModerationFields(serviceData as Record<string, unknown>);

    const isDraft = serviceData.status === 'draft';

    // Classification is owned by the MCOM Central business profile. Always
    // prefer the synced business taxonomy over whatever the client sent.
    const taxonomy = resolveBusinessTaxonomy(business);
    if (taxonomy.sector) serviceData.sector = taxonomy.sector;
    if (taxonomy.category) serviceData.category = taxonomy.category;
    if (taxonomy.subCategory) serviceData.subcategory = taxonomy.subCategory;

    if (!isDraft && !serviceData.sector) {
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

    // Draft saves are intentionally allowed to be incomplete. Publishing
    // still requires at least one service image.
    if (!isDraft && !hasServiceImage) {
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

    if (serviceData.images || serviceData.media) {
      await this.capabilityService.assertListingImageLimit(
        userId,
        serviceData.media ?? [],
      );
    }

    if (serviceData.isFeatured) {
      await this.capabilityService.assertFeaturedListingAllowed(userId);
    }
    if (serviceData.shortDesc && !serviceData.shortDescription) {
      serviceData.shortDescription = serviceData.shortDesc;
    }
    if (serviceData.fullDesc && !serviceData.description) {
      serviceData.description = serviceData.fullDesc;
    }

    this.applyServiceCreationRules(
      serviceData,
      business,
      isDraft,
      !isDraft,
      !isDraft,
    );

    serviceData.status = isDraft ? 'draft' : 'published';
    serviceData.isActive = isDraft ? false : (serviceData.isActive ?? true);

    const service = this.serviceRepository.create({
      ...(serviceData as Record<string, unknown>),
      businessId: business.id,
      // Every new merchant service waits for admin approval before it can be
      // seen or booked by anyone other than the owner.
      approvalStatus: ApprovalStatus.PENDING,
      adminDisabled: false,
    } as Partial<Service>);

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
      where.approvalStatus = ApprovalStatus.APPROVED;
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
      service.approvalStatus === ApprovalStatus.APPROVED &&
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
        'business.location',
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
    stripModerationFields(serviceData as Record<string, unknown>);

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

    if (serviceData.images || serviceData.media) {
      await this.capabilityService.assertListingImageLimit(
        userId,
        serviceData.media ?? [],
      );
    }

    if (serviceData.isFeatured === true && !service.isFeatured) {
      await this.capabilityService.assertFeaturedListingAllowed(userId, {
        serviceId: service.id,
      });
    }

    if (serviceData.shortDesc && !serviceData.shortDescription) {
      serviceData.shortDescription = serviceData.shortDesc;
    }
    if (serviceData.fullDesc && !serviceData.description) {
      serviceData.description = serviceData.fullDesc;
    }

    // Publishing a draft uses the same minimum content rules as creating a
    // published service, even when the merchant activates it from the table.
    if (serviceData.status === 'published' && service.status === 'draft') {
      const media = serviceData.media ?? service.media ?? [];
      const hasImage = media.some(
        (url) =>
          typeof url === 'string' &&
          !/\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i.test(url),
      );
      if (!hasImage) {
        throw new BadRequestException(
          'Add at least one service image before publishing this draft.',
        );
      }

      const pricingType = service.pricingType;
      if (
        ['fixed', 'startingFrom', 'hourly'].includes(pricingType) &&
        service.price == null &&
        service.fixedPrice == null &&
        service.pricePerHour == null
      ) {
        throw new BadRequestException(
          'Add a price before publishing this draft.',
        );
      }

      if (
        Array.isArray(service.deliveryOptions) &&
        service.deliveryOptions.length === 0
      ) {
        throw new BadRequestException(
          'Select at least one service delivery option before publishing this draft.',
        );
      }
    }

    // A draft may be published later, so re-run the same rules whenever the
    // pricing / booking payload is written (e.g. flipping draft -> published).
    // Merge the existing row first so partial updates (e.g. the dashboard's
    // active/inactive toggle) never wipe unrelated service fields.
    const isDraft = serviceData.status === 'draft';
    const hasPricingInput = [
      'pricingType',
      'price',
      'priceMax',
      'pricingModel',
      'fixedPrice',
      'pricePerHour',
      'pricePerUnit',
      'basePrice',
      'isQuoteModel',
    ].some(
      (key) => (serviceData as Record<string, unknown>)[key] !== undefined,
    );

    const mergedServiceData: Record<string, any> = {
      pricingType: service.pricingType,
      pricingModel: service.pricingModel,
      price: service.price,
      priceMax: service.priceMax,
      fixedPrice: service.fixedPrice,
      pricePerHour: service.pricePerHour,
      pricePerUnit: service.pricePerUnit,
      basePrice: service.basePrice,
      isQuoteModel: service.isQuoteModel,
      deliveryOptions: service.deliveryOptions,
      deliveryConfig: service.deliveryConfig,
      customerAction: service.customerAction,
      availability: service.availability,
      duration: service.duration,
      faqs: service.faqs,
      serviceLocation: service.serviceLocation,
      ...serviceData,
    };

    this.applyServiceCreationRules(
      mergedServiceData,
      service.business,
      isDraft,
      !isDraft && hasPricingInput,
      !isDraft && serviceData.deliveryOptions !== undefined,
    );

    if (serviceData.status === 'draft') {
      mergedServiceData.isActive = false;
    } else if (
      serviceData.status === 'published' &&
      mergedServiceData.isActive === undefined
    ) {
      mergedServiceData.isActive = true;
    }

    Object.assign(service, mergedServiceData);

    // A rejected service becomes editable again and automatically returns to
    // the review queue when the owner saves changes.
    if (service.approvalStatus === ApprovalStatus.REJECTED) {
      resubmitForApproval(service);
    }

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

  /* ------------------------------------------------------------------ */
  /* Create Service flow                                                */
  /* ------------------------------------------------------------------ */

  private toNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private derivePricingType(data: Record<string, any>): PricingType {
    if (data.pricingType) {
      return data.pricingType as PricingType;
    }
    if (data.isQuoteModel) {
      return PricingType.QUOTE;
    }
    if (data.pricingModel === PricingModel.PER_HOUR) {
      return PricingType.HOURLY;
    }
    return PricingType.FIXED;
  }

  private defaultAvailability() {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const weekend = ['Saturday', 'Sunday'];
    return {
      schedule: [
        ...weekdays.map((day) => ({
          day,
          enabled: true,
          startTime: '09:00',
          endTime: '17:00',
          breaks: [],
        })),
        ...weekend.map((day) => ({
          day,
          enabled: false,
          startTime: '09:00',
          endTime: '17:00',
          breaks: [],
        })),
      ],
      slotDuration: 60,
      bufferTime: 0,
      maxBookingsPerSlot: 1,
      staffPerBooking: 1,
      serviceRadiusKm: 0,
    };
  }

  private buildServiceLocation(
    business: Business,
    supplied?: Record<string, unknown> | null,
  ): Record<string, unknown> | null {
    const location = (business as any).location;
    if (!location) {
      return supplied ?? null;
    }
    return {
      addressLine1: location.addressLine1 ?? null,
      addressLine2: location.addressLine2 ?? null,
      city: location.city ?? null,
      state: location.state ?? null,
      postcode: location.postcode ?? null,
      latitude: location.latitude ?? null,
      longitude: location.longitude ?? null,
    };
  }

  /**
   * Keeps the new service profile fields and the legacy booking fields in
   * sync. The storefront, bookings and checkout still read `pricingModel`,
   * `fixedPrice` and `pricePerHour`, so those are derived here.
   */
  private applyServiceCreationRules(
    serviceData: Record<string, any>,
    business: Business,
    isDraft: boolean,
    enforcePricing = !isDraft,
    enforceDelivery = !isDraft,
  ): void {
    if (!serviceData.pricingModel) {
      serviceData.pricingModel = PricingModel.FIXED;
    }

    const pricingType = this.derivePricingType(serviceData);
    const hasNewPricing =
      serviceData.pricingType !== undefined ||
      serviceData.price !== undefined ||
      serviceData.priceMax !== undefined;

    const price =
      this.toNumber(serviceData.price) ??
      this.toNumber(serviceData.fixedPrice) ??
      this.toNumber(serviceData.pricePerHour) ??
      this.toNumber(serviceData.pricePerUnit) ??
      this.toNumber(serviceData.basePrice);
    const priceMax = this.toNumber(serviceData.priceMax);

    if (!hasNewPricing) {
      // Legacy client: keep the old pricing shape, but record the equivalent
      // new pricing type so both reads stay consistent.
      serviceData.pricingType = pricingType;
      if (serviceData.price === undefined) {
        serviceData.price = price ?? null;
      }
    } else {
      if (
        enforcePricing &&
        (pricingType === PricingType.FIXED ||
          pricingType === PricingType.STARTING_FROM ||
          pricingType === PricingType.HOURLY) &&
        price === undefined
      ) {
        throw new BadRequestException(
          'A price is required for the selected pricing option.',
        );
      }

      if (pricingType === PricingType.RANGE) {
        if (enforcePricing && (price === undefined || priceMax === undefined)) {
          throw new BadRequestException(
            'Both a minimum and maximum price are required for price-range pricing.',
          );
        }
        if (price !== undefined && priceMax !== undefined && priceMax < price) {
          throw new BadRequestException(
            'The maximum price cannot be less than the minimum price.',
          );
        }
      }

      serviceData.pricingType = pricingType;

      switch (pricingType) {
        case PricingType.QUOTE:
          serviceData.price = null;
          serviceData.priceMax = null;
          serviceData.fixedPrice = null;
          serviceData.pricePerHour = null;
          serviceData.pricingModel = PricingModel.FIXED;
          serviceData.isQuoteModel = true;
          break;
        case PricingType.FREE:
          serviceData.price = 0;
          serviceData.priceMax = null;
          serviceData.fixedPrice = 0;
          serviceData.pricePerHour = null;
          serviceData.pricingModel = PricingModel.FIXED;
          serviceData.isQuoteModel = false;
          break;
        case PricingType.RANGE:
          serviceData.price = price ?? null;
          serviceData.priceMax = priceMax ?? null;
          serviceData.fixedPrice = price ?? null;
          serviceData.pricePerHour = null;
          serviceData.pricingModel = PricingModel.FIXED;
          serviceData.isQuoteModel = false;
          break;
        case PricingType.HOURLY:
          serviceData.price = price ?? null;
          serviceData.priceMax = null;
          serviceData.fixedPrice = null;
          serviceData.pricePerHour = price ?? null;
          serviceData.pricingModel = PricingModel.PER_HOUR;
          serviceData.isQuoteModel = false;
          break;
        case PricingType.STARTING_FROM:
        case PricingType.FIXED:
        default:
          serviceData.price = price ?? null;
          serviceData.priceMax = null;
          serviceData.fixedPrice = price ?? null;
          serviceData.pricePerHour = null;
          serviceData.pricingModel = PricingModel.FIXED;
          serviceData.isQuoteModel = false;
          break;
      }
    }

    // Delivery options drive the legacy deliveryConfig used by bookings.
    if (Array.isArray(serviceData.deliveryOptions)) {
      const allowed = new Set(Object.values(ServiceDeliveryOption));
      const options = Array.from(
        new Set(
          serviceData.deliveryOptions.filter((option: string) =>
            allowed.has(option as ServiceDeliveryOption),
          ),
        ),
      ) as ServiceDeliveryOption[];

      if (enforceDelivery && options.length === 0) {
        throw new BadRequestException(
          'Select at least one service delivery option.',
        );
      }

      serviceData.deliveryOptions = options;

      if (options.length > 0) {
        const mode = options.includes(ServiceDeliveryOption.AT_CUSTOMER)
          ? 'onsite'
          : options.includes(ServiceDeliveryOption.AT_BUSINESS)
            ? 'atShop'
            : 'remote';
        serviceData.deliveryConfig = {
          ...(serviceData.deliveryConfig ?? {}),
          mode,
        };
      }
    } else if (serviceData.deliveryConfig?.mode) {
      const mode = serviceData.deliveryConfig.mode;
      serviceData.deliveryOptions = [
        mode === 'atShop'
          ? ServiceDeliveryOption.AT_BUSINESS
          : mode === 'remote'
            ? ServiceDeliveryOption.ONLINE
            : ServiceDeliveryOption.AT_CUSTOMER,
      ];
    }

    // Customer action is the source of truth for quote/enquiry flows.
    if (!serviceData.customerAction) {
      serviceData.customerAction = serviceData.isQuoteModel
        ? CustomerAction.REQUEST_QUOTE
        : CustomerAction.BOOK_NOW;
    }
    if (serviceData.customerAction === CustomerAction.REQUEST_QUOTE) {
      serviceData.isQuoteModel = true;
    }

    if (Array.isArray(serviceData.faqs)) {
      serviceData.faqs = serviceData.faqs
        .filter(
          (faq: any) =>
            typeof faq?.question === 'string' &&
            faq.question.trim().length > 0 &&
            typeof faq?.answer === 'string' &&
            faq.answer.trim().length > 0,
        )
        .map((faq: any) => ({
          question: faq.question.trim(),
          answer: faq.answer.trim(),
        }));
    }

    const duration = this.toNumber(serviceData.duration);
    if (duration !== undefined && duration > 0) {
      const availability =
        serviceData.availability && typeof serviceData.availability === 'object'
          ? serviceData.availability
          : this.defaultAvailability();
      serviceData.availability = { ...availability, slotDuration: duration };
    }

    serviceData.serviceLocation = this.buildServiceLocation(
      business,
      serviceData.serviceLocation,
    );
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
          approvalStatus: ApprovalStatus.APPROVED,
          status: 'published',
          isActive: true,
          adminDisabled: false,
        },
        {
          description: ILike(`%${term}%`),
          approvalStatus: ApprovalStatus.APPROVED,
          status: 'published',
          isActive: true,
          adminDisabled: false,
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
      .leftJoin('business.location', 'businessLocation')
      .where('service.approvalStatus = :approvalStatus', {
        approvalStatus: ApprovalStatus.APPROVED,
      })
      .andWhere('service.isActive = :isActive', { isActive: true })
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

    applyBusinessLocationFilter(
      queryBuilder,
      'business',
      searchDto,
      'loc',
      'businessLocation',
    );
    applyBusinessNearOrder(queryBuilder, 'business', searchDto);

    queryBuilder
      .addOrderBy('service.created_at', 'DESC')
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
