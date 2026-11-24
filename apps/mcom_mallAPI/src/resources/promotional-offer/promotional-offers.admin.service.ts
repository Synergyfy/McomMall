import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import { PromotionalOffer } from './entities/promotional-offer.entity';
import { PromotionalOfferBusiness } from './entities/promotional-offer-business.entity';
import { BusinessPromotionalOffer } from './entities/business-promotional-offer.entity';
import { AffiliateClick } from './entities/affiliate-click.entity';
import { AffiliateTransaction } from './entities/affiliate-transaction.entity';
import { CreatePromotionalOfferDto } from './dto/create-promotional-offer.dto';
import { UpdatePromotionalOfferDto } from './dto/update-promotional-offer.dto';
import {
  AffiliateReportQueryDto,
  PromotionalOfferQueryDto,
} from './dto/promotional-offer-query.dto';
import { penceAggregateToPounds } from '../../common/money/money';
import { AwinSyncService } from './awin-sync.service';

@Injectable()
export class PromotionalOffersAdminService {
  constructor(
    @InjectRepository(PromotionalOffer)
    private readonly offersRepository: Repository<PromotionalOffer>,
    @InjectRepository(PromotionalOfferBusiness)
    private readonly offerBusinessRepository: Repository<PromotionalOfferBusiness>,
    @InjectRepository(BusinessPromotionalOffer)
    private readonly businessOfferRepository: Repository<BusinessPromotionalOffer>,
    @InjectRepository(AffiliateClick)
    private readonly clickRepository: Repository<AffiliateClick>,
    @InjectRepository(AffiliateTransaction)
    private readonly transactionRepository: Repository<AffiliateTransaction>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly awinSyncService: AwinSyncService,
  ) {}

  private toPatch(
    dto: CreatePromotionalOfferDto | UpdatePromotionalOfferDto,
  ): Record<string, unknown> {
    const patch: Record<string, unknown> = { ...dto };
    delete patch.businessIds;

    if ('startDate' in patch) {
      const value = patch.startDate;
      patch.startDate = value ? new Date(String(value)) : null;
    }
    if ('endDate' in patch) {
      const value = patch.endDate;
      patch.endDate = value ? new Date(String(value)) : null;
    }

    return patch;
  }

  async getStats() {
    const [total, active, draft, inactive, imported, clicks, transactions] =
      await Promise.all([
        this.offersRepository.count(),
        this.offersRepository.count({ where: { status: 'active' } }),
        this.offersRepository.count({ where: { status: 'draft' } }),
        this.offersRepository.count({ where: { status: 'inactive' } }),
        this.businessOfferRepository.count({ where: { isActive: true } }),
        this.clickRepository.count(),
        this.transactionRepository.count(),
      ]);

    return {
      total,
      active,
      draft,
      inactive,
      imported,
      clicks,
      transactions,
    };
  }

  async findAll(query: PromotionalOfferQueryDto) {
    const { page = 1, limit = 20, search, offeringType, status, availability } =
      query;
    const qb = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.availableBusinesses', 'selection')
      .leftJoinAndSelect('selection.business', 'selectionBusiness')
      .orderBy('offer.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere(
        '(offer.name ILIKE :search OR offer.advertiserName ILIKE :search OR offer.category ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (offeringType) {
      qb.andWhere('offer.offeringType = :offeringType', { offeringType });
    }
    if (status) {
      qb.andWhere('offer.status = :status', { status });
    }
    if (availability) {
      qb.andWhere('offer.availability = :availability', { availability });
    }

    const [offers, total] = await qb.getManyAndCount();

    const importCounts = offers.length
      ? await this.businessOfferRepository
          .createQueryBuilder('bpo')
          .select('bpo.offerId', 'offerId')
          .addSelect('COUNT(*)', 'count')
          .where('bpo.isActive = true')
          .andWhere('bpo.offerId IN (:...ids)', {
            ids: offers.map((offer) => offer.id),
          })
          .groupBy('bpo.offerId')
          .getRawMany<{ offerId: string; count: string }>()
      : [];

    const importMap = new Map(
      importCounts.map((row) => [row.offerId, Number(row.count)]),
    );

    return {
      data: offers.map((offer) => ({
        ...offer,
        selectedBusinesses:
          offer.availableBusinesses?.map((selection) => ({
            id: selection.businessId,
            name: selection.business?.businessName || 'Business',
          })) ?? [],
        importedCount: importMap.get(offer.id) ?? 0,
        availableBusinesses: undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string) {
    const offer = await this.offersRepository.findOne({
      where: { id },
      relations: [
        'availableBusinesses',
        'availableBusinesses.business',
      ],
    });
    if (!offer) throw new NotFoundException('Promotional offer not found');

    return {
      ...offer,
      selectedBusinesses:
        offer.availableBusinesses?.map((selection) => ({
          id: selection.businessId,
          name: selection.business?.businessName || 'Business',
        })) ?? [],
      availableBusinesses: undefined,
    };
  }

  async create(dto: CreatePromotionalOfferDto, adminId?: string) {
    const patch = this.toPatch(dto);
    const offer = this.offersRepository.create({
      ...(patch as Partial<PromotionalOffer>),
      createdById: adminId ?? null,
      availability: dto.availability ?? 'all',
      status: dto.status ?? 'draft',
    });
    const saved = await this.offersRepository.save(offer);

    if ((dto.availability ?? 'all') === 'selected') {
      await this.replaceBusinessSelection(saved.id, dto.businessIds ?? []);
    }

    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdatePromotionalOfferDto) {
    const offer = await this.offersRepository.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Promotional offer not found');

    Object.assign(offer, this.toPatch(dto));
    await this.offersRepository.save(offer);

    if (dto.businessIds !== undefined || dto.availability !== undefined) {
      const availability = dto.availability ?? offer.availability;
      if (availability === 'selected') {
        await this.replaceBusinessSelection(id, dto.businessIds ?? []);
      } else if (dto.availability === 'all') {
        await this.offerBusinessRepository.delete({ offerId: id });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const offer = await this.offersRepository.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Promotional offer not found');
    await this.offersRepository.softDelete(id);
    return { message: 'Promotional offer archived.' };
  }

  private async replaceBusinessSelection(
    offerId: string,
    businessIds: string[],
  ) {
    const unique = Array.from(new Set(businessIds.filter(Boolean)));
    await this.offerBusinessRepository.delete({ offerId });

    if (unique.length === 0) return;

    const businesses = await this.businessRepository.find({
      where: { id: In(unique) },
      select: ['id'],
    });
    const validIds = businesses.map((business) => business.id);
    if (validIds.length !== unique.length) {
      throw new BadRequestException(
        'One or more selected businesses could not be found.',
      );
    }

    await this.offerBusinessRepository.save(
      validIds.map((businessId) =>
        this.offerBusinessRepository.create({ offerId, businessId }),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Affiliate reporting
  // ---------------------------------------------------------------------------

  async getAffiliateSummary() {
    const [clicks, transactionCount, pending, approved, rejected] =
      await Promise.all([
        this.clickRepository.count(),
        this.transactionRepository.count(),
        this.transactionRepository.count({ where: { status: 'pending' } }),
        this.transactionRepository.count({ where: { status: 'approved' } }),
        this.transactionRepository.count({ where: { status: 'rejected' } }),
      ]);

    const commissionRow = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(transaction.commissionAmount), 0)', 'total')
      .where('transaction.status IN (:...statuses)', {
        statuses: ['approved', 'amended'],
      })
      .getRawOne<{ total: string }>();

    const pendingRow = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(transaction.commissionAmount), 0)', 'total')
      .where('transaction.status = :status', { status: 'pending' })
      .getRawOne<{ total: string }>();

    const attributedClicks = await this.clickRepository.count({
      where: { attributed: true },
    });

    return {
      totalClicks: clicks,
      attributedClicks,
      transactions: transactionCount,
      pendingTransactions: pending,
      approvedTransactions: approved,
      rejectedTransactions: rejected,
      approvedCommission: penceAggregateToPounds(commissionRow?.total),
      pendingCommission: penceAggregateToPounds(pendingRow?.total),
      conversionRate: clicks
        ? Number(((transactionCount / clicks) * 100).toFixed(2))
        : 0,
    };
  }

  async listClicks(query: AffiliateReportQueryDto) {
    const { page = 1, limit = 50, businessId, offerId, from, to } = query;

    const qb = this.clickRepository
      .createQueryBuilder('click')
      .leftJoinAndSelect('click.offer', 'offer')
      .leftJoinAndSelect('click.business', 'business')
      .withDeleted()
      .orderBy('click.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (businessId) {
      qb.andWhere('click.businessId = :businessId', { businessId });
    }
    if (offerId) {
      qb.andWhere('click.offerId = :offerId', { offerId });
    }
    if (from) {
      qb.andWhere('click.created_at >= :from', { from: new Date(from) });
    }
    if (to) {
      qb.andWhere('click.created_at <= :to', { to: new Date(to) });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((click) => ({
        id: click.id,
        offerId: click.offerId,
        offerName: click.offer?.name || 'Platform offer',
        businessId: click.businessId,
        businessName: click.business?.businessName || 'MCOM platform',
        clickRef: click.clickRef,
        source: click.source,
        attributed: click.attributed,
        createdAt: click.created_at,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async listTransactions(query: AffiliateReportQueryDto) {
    const { page = 1, limit = 50, businessId, offerId, status, from, to } =
      query;

    const qb = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.offer', 'offer')
      .leftJoinAndSelect('transaction.business', 'business')
      .withDeleted()
      .orderBy('transaction.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (businessId) {
      qb.andWhere('transaction.businessId = :businessId', { businessId });
    }
    if (offerId) {
      qb.andWhere('transaction.offerId = :offerId', { offerId });
    }
    if (status) {
      qb.andWhere('transaction.status = :status', { status });
    }
    if (from) {
      qb.andWhere('transaction.created_at >= :from', {
        from: new Date(from),
      });
    }
    if (to) {
      qb.andWhere('transaction.created_at <= :to', { to: new Date(to) });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((transaction) => ({
        id: transaction.id,
        externalTransactionId: transaction.externalTransactionId,
        offerId: transaction.offerId,
        offerName: transaction.offer?.name || 'Promotional offer',
        businessId: transaction.businessId,
        businessName: transaction.business?.businessName || 'Unattributed',
        clickRef: transaction.clickRef,
        advertiserName: transaction.advertiserName,
        status: transaction.status,
        saleAmount: transaction.saleAmount,
        commissionAmount: transaction.commissionAmount,
        currency: transaction.currency,
        transactionDate: transaction.transactionDate,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async syncAwin(startDate?: string, endDate?: string) {
    return this.awinSyncService.syncTransactions(startDate, endDate);
  }
}
