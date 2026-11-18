import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from 'src/resources/services/entities/service.entity';
import { Business } from 'src/resources/listings/entities/listing.entity';
import { PricingModel } from 'src/resources/services/service.enum';
import { resolveBusinessTaxonomy } from 'src/common/taxonomy/business-taxonomy';
import { Repository } from 'typeorm';
import {
  AdminServiceStatus,
  CreateAdminServiceDto,
} from '../dto/create-admin-service.dto';
import {
  ServiceQueryDto,
  PaginatedServicesDto,
  ServiceStatsDto,
  AdminServiceDto,
} from '../dto/catalog.dto';
import { ApprovalStatus } from 'src/common/moderation/catalog-approval';

@Injectable()
export class AdminServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async getStats(): Promise<ServiceStatsDto> {
    const [total, active, pending, rejected, delisted, avgDurationResult] =
      await Promise.all([
        this.servicesRepository.count(),
        this.servicesRepository.count({
          where: {
            status: 'published',
            isActive: true,
            approvalStatus: ApprovalStatus.APPROVED,
            adminDisabled: false,
          },
        }),
        this.servicesRepository.count({
          where: { approvalStatus: ApprovalStatus.PENDING },
        }),
        this.servicesRepository.count({
          where: { approvalStatus: ApprovalStatus.REJECTED },
        }),
        this.servicesRepository.count({ where: { adminDisabled: true } }),
        this.servicesRepository
          .createQueryBuilder('service')
          .select('AVG(service.duration)', 'avg')
          .getRawOne(),
      ]);

    return {
      total,
      active,
      pending,
      rejected,
      delisted,
      avgDuration: Math.round(Number(avgDurationResult?.avg || 0)),
    };
  }

  async findAll(query: ServiceQueryDto): Promise<PaginatedServicesDto> {
    const { search, status, category, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const qb = this.servicesRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.business', 'business')
      .take(limit)
      .skip(skip)
      .orderBy('service.created_at', 'DESC');

    if (search) {
      qb.andWhere(
        '(service.name ILIKE :search OR business.businessName ILIKE :search OR service.id::text ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        qb.andWhere('service.status = :sStatus', { sStatus: 'published' });
        qb.andWhere('service.isActive = true');
        qb.andWhere('service.approvalStatus = :approvalStatus', {
          approvalStatus: ApprovalStatus.APPROVED,
        });
        qb.andWhere('service.adminDisabled = false');
      } else if (status === 'inactive') {
        qb.andWhere(
          '(service.adminDisabled = true OR service.approvalStatus != :approvedStatus OR service.status = :draftStatus)',
          {
            approvedStatus: ApprovalStatus.APPROVED,
            draftStatus: 'draft',
          },
        );
      } else if (status === 'pending') {
        qb.andWhere('service.approvalStatus = :approvalStatus', {
          approvalStatus: ApprovalStatus.PENDING,
        });
      } else if (status === 'rejected') {
        qb.andWhere('service.approvalStatus = :approvalStatus', {
          approvalStatus: ApprovalStatus.REJECTED,
        });
      } else if (status === 'delisted') {
        qb.andWhere('service.adminDisabled = true');
      } else {
        qb.andWhere('service.status = :sStatus', { sStatus: status });
      }
    }

    if (category && category !== 'all') {
      // Since services don't have a direct 'category' column like products, we might skip or filter by business categories.
      // For simplicity, if the frontend sends Spa/Auto, we might need a more complex join.
      // For now, I'll ignore category filter for services unless I find the column.
    }

    const [services, total] = await qb.getManyAndCount();

    const mappedData: AdminServiceDto[] = services.map((s) => ({
      id: s.id,
      name: s.name,
      businessName: s.business?.businessName || 'Unknown',
      businessId: s.business?.id || '',
      category: 'Service', // Placeholder
      price: Number(s.fixedPrice || s.pricePerHour || s.pricePerUnit || 0),
      duration: s.duration,
      status: s.adminDisabled
        ? 'inactive'
        : s.approvalStatus !== ApprovalStatus.APPROVED
          ? 'inactive'
          : s.status === 'published'
            ? 'active'
            : 'inactive',
      description: s.description || '',
      images: s.media || [],
      approvalStatus: s.approvalStatus,
      adminDisabled: s.adminDisabled,
      reviewNote: s.reviewNote ?? null,
      reviewedAt: s.reviewedAt ?? null,
      createdAt: s.created_at,
    }));

    return {
      data: mappedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deactivate(id: string) {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return this.servicesRepository.update(id, { adminDisabled: true });
  }

  async activate(id: string) {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    // The legacy admin "Activate" action both republishes a delisted service
    // and approves it when it is still awaiting review.
    return this.servicesRepository.update(id, {
      adminDisabled: false,
      approvalStatus: ApprovalStatus.APPROVED,
      reviewedAt: new Date(),
    });
  }

  async approve(id: string, reviewerId: string) {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return this.servicesRepository.update(id, {
      approvalStatus: ApprovalStatus.APPROVED,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    });
  }

  async reject(id: string, reviewerId: string, reviewNote?: string) {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return this.servicesRepository.update(id, {
      approvalStatus: ApprovalStatus.REJECTED,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNote: reviewNote ?? null,
    });
  }

  async remove(id: string) {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return this.servicesRepository.softDelete(id);
  }

  async create(dto: CreateAdminServiceDto): Promise<Service> {
    const business = await this.businessRepository.findOne({
      where: { id: dto.businessId },
      relations: ['sector', 'category', 'subCategory'],
    });
    if (!business) {
      throw new NotFoundException(
        `Business with ID ${dto.businessId} was not found`,
      );
    }

    // Admin-created services inherit the same Central business taxonomy as the
    // merchant-facing flow; the DTO's category is only a fallback.
    const taxonomy = resolveBusinessTaxonomy(business);

    const service = this.servicesRepository.create({
      name: dto.name,
      businessId: dto.businessId,
      description: dto.description,
      sector: taxonomy.sector || undefined,
      category: taxonomy.category || dto.category,
      subcategory: taxonomy.subCategory || undefined,
      fixedPrice: dto.fixedPrice,
      duration: dto.duration ?? 0,
      pricingModel: PricingModel.FIXED,
      status:
        dto.status === AdminServiceStatus.INACTIVE ? 'draft' : 'published',
      // Admin-authored services are approved on creation.
      approvalStatus: ApprovalStatus.APPROVED,
      reviewedAt: new Date(),
    });
    return this.servicesRepository.save(service);
  }
}
