import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
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
import { ActivitiesService } from '../activities/activities.service';
import { SearchServiceDto } from './dto/search-service.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ActionType, CapabilityService } from '../capability/capability.service';
import { ServiceSearchDto } from './dto/service-search.dto';
import { PageDto } from '../../common/dto/page.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';

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

    await this.capabilityService.checkPermission(userId, ActionType.CREATE_SERVICE, {
      currentCount: currentServiceCount,
    });

    const business = await this.businessRepository.findOne({
      where: { id: createServiceDto.businessId },
      relations: ['user'],
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

    // Map frontend fields to backend
    if (serviceData.images && !serviceData.media) {
      serviceData.media = serviceData.images;
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
  ): Promise<{
    data: Service[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const business = await this.businessRepository.findOneBy({
      id: businessId,
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }
    const [data, total] = await this.serviceRepository.findAndCount({
      where: { businessId },
      relations: ['bundledServices', 'configurableAddons'],
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

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    userId: string,
  ): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['business', 'business.user'],
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

    // Map frontend fields to backend
    if (serviceData.images && !serviceData.media) {
      serviceData.media = serviceData.images;
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
        { name: ILike(`%${term}%`) },
        { description: ILike(`%${term}%`) },
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
      .andWhere('service.status = :status', { status: 'published' });

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
}
