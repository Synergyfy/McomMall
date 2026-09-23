import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstitutionalPartner, PartnerStatus } from './entities/institutional-partner.entity';
import { CreateInstitutionalPartnerDto } from './dto/create-institutional-partner.dto';
import { UpdateInstitutionalPartnerDto } from './dto/update-institutional-partner.dto';

@Injectable()
export class InstitutionalPartnersService {
  constructor(
    @InjectRepository(InstitutionalPartner)
    private readonly partnerRepository: Repository<InstitutionalPartner>,
  ) {}

  async create(dto: CreateInstitutionalPartnerDto): Promise<InstitutionalPartner> {
    const partner = this.partnerRepository.create(dto);
    return this.partnerRepository.save(partner);
  }

  async findAll(status?: PartnerStatus, search?: string): Promise<InstitutionalPartner[]> {
    const qb = this.partnerRepository
      .createQueryBuilder('partner')
      .orderBy('partner.created_at', 'DESC');
    if (status) {
      qb.andWhere('partner.status = :status', { status });
    }
    if (search) {
      qb.andWhere(
        '(partner.name ILIKE :search OR partner.contactPerson ILIKE :search OR partner.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    return qb.getMany();
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    totalPlaques: number;
    totalBusinesses: number;
  }> {
    const [total, active, pending, sums] = await Promise.all([
      this.partnerRepository.count(),
      this.partnerRepository.count({ where: { status: PartnerStatus.ACTIVE } }),
      this.partnerRepository.count({ where: { status: PartnerStatus.PENDING } }),
      this.partnerRepository
        .createQueryBuilder('partner')
        .select('COALESCE(SUM(partner.plaqueCount), 0)', 'plaques')
        .addSelect('COALESCE(SUM(partner.businessCount), 0)', 'businesses')
        .getRawOne(),
    ]);
    return {
      total,
      active,
      pending,
      totalPlaques: Number(sums?.plaques ?? 0),
      totalBusinesses: Number(sums?.businesses ?? 0),
    };
  }

  async findOne(id: string): Promise<InstitutionalPartner> {
    const partner = await this.partnerRepository.findOne({ where: { id } });
    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} was not found`);
    }
    return partner;
  }

  async update(id: string, dto: UpdateInstitutionalPartnerDto): Promise<InstitutionalPartner> {
    const partner = await this.findOne(id);
    Object.assign(partner, dto);
    return this.partnerRepository.save(partner);
  }

  async remove(id: string): Promise<void> {
    const partner = await this.findOne(id);
    await this.partnerRepository.remove(partner);
  }
}
