import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute } from './entities/dispute.entity';
import { CreateDisputeDto, DisputeQueryDto, PaginatedDisputesDto, DisputeStatsDto, AdminDisputeDto } from './dto/dispute.dto';
import { DisputeStatus } from './dispute.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DisputeService {
  constructor(
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
  ) {}

  async create(createDisputeDto: CreateDisputeDto, customer: User): Promise<Dispute> {
    const dispute = this.disputeRepository.create({
      ...createDisputeDto,
      customerId: customer.id,
    });
    return this.disputeRepository.save(dispute);
  }

  async getStats(): Promise<DisputeStatsDto> {
    const [total, open, underReview, escalated] = await Promise.all([
      this.disputeRepository.count(),
      this.disputeRepository.count({ where: { status: DisputeStatus.NEW } }),
      this.disputeRepository.count({ where: { status: DisputeStatus.UNDER_REVIEW } }),
      this.disputeRepository.count({ where: { status: DisputeStatus.ESCALATED } }),
    ]);

    return { total, open, underReview, escalated };
  }

  async findAll(query: DisputeQueryDto): Promise<PaginatedDisputesDto> {
    const { search, status, reason, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const qb = this.disputeRepository.createQueryBuilder('dispute')
      .leftJoinAndSelect('dispute.customer', 'customer')
      .leftJoinAndSelect('dispute.business', 'business')
      .take(limit)
      .skip(skip)
      .orderBy('dispute.created_at', 'DESC');

    if (search) {
      qb.andWhere('(dispute.id::text ILIKE :search OR customer.name ILIKE :search OR business.businessName ILIKE :search)', { search: `%${search}%` });
    }

    if (status && status !== 'all') {
      qb.andWhere('dispute.status = :status', { status });
    }

    if (reason && reason !== 'all') {
      qb.andWhere('dispute.reason = :reason', { reason });
    }

    const [disputes, total] = await qb.getManyAndCount();

    const mappedData: AdminDisputeDto[] = disputes.map(d => ({
      id: d.id,
      customerName: d.customer?.name || 'Unknown',
      customerId: d.customerId,
      businessName: d.business?.businessName || 'Unknown',
      businessId: d.businessId,
      orderId: d.orderId,
      amount: Number(d.amount),
      reason: d.reason,
      description: d.description,
      status: d.status,
      evidence: d.evidence || [],
      createdAt: d.created_at,
    }));

    return {
      data: mappedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async resolve(id: string, decision: string, notes: string, adminId: string) {
    const dispute = await this.disputeRepository.findOne({ where: { id } });
    if (!dispute) throw new NotFoundException('Dispute not found');

    return this.disputeRepository.update(id, {
      status: DisputeStatus.RESOLVED,
      resolutionDecision: decision,
      resolutionNotes: notes,
      resolvedBy: adminId,
    });
  }
}
