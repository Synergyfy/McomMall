import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from 'src/resources/services/entities/service.entity';
import { Repository } from 'typeorm';
import {
  ServiceQueryDto,
  PaginatedServicesDto,
  ServiceStatsDto,
  AdminServiceDto,
} from '../dto/catalog.dto';

@Injectable()
export class AdminServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  async getStats(): Promise<ServiceStatsDto> {
    const [total, active, avgDurationResult] = await Promise.all([
      this.servicesRepository.count(),
      this.servicesRepository.count({ where: { status: 'published' } }),
      this.servicesRepository
        .createQueryBuilder('service')
        .select('AVG(service.duration)', 'avg')
        .getRawOne(),
    ]);

    return {
      total,
      active,
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
      let sStatus = status;
      if (status === 'active') sStatus = 'published';
      if (status === 'inactive') sStatus = 'draft';
      qb.andWhere('service.status = :sStatus', { sStatus });
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
      status: s.status === 'published' ? 'active' : 'inactive',
      description: s.description || '',
      images: s.media || [],
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

  async remove(id: string) {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return this.servicesRepository.softDelete(id);
  }
}
