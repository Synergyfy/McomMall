import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, ObjectLiteral, Repository } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import { Sector } from '../taxonomy/entities/sector.entity';
import { TaxonomyCategory } from '../taxonomy/entities/taxonomy-category.entity';
import { TaxonomySubcategory } from '../taxonomy/entities/taxonomy-subcategory.entity';
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
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
    @InjectRepository(TaxonomyCategory)
    private readonly categoryRepository: Repository<TaxonomyCategory>,
    @InjectRepository(TaxonomySubcategory)
    private readonly subcategoryRepository: Repository<TaxonomySubcategory>,
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

  private inputString(value: unknown): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;
    const trimmed = String(value).trim();
    return trimmed.length ? trimmed : null;
  }

  private taxonomyId(row: { id: string; centralId?: string | null }): string {
    return row.centralId || row.id;
  }

  private async findTaxonomyRow<
    T extends ObjectLiteral & {
      id: string;
      name: string;
      centralId?: string | null;
    },
  >(
    repository: Repository<T>,
    idValue: string | null | undefined,
    nameValue: string | null | undefined,
    label: string,
    strictId: boolean,
  ): Promise<T | null> {
    if (idValue) {
      const row = await repository
        .createQueryBuilder('taxonomy')
        .where('taxonomy.centralId = :id OR taxonomy.id = :id', { id: idValue })
        .andWhere('taxonomy."centralId" IS NOT NULL')
        .getOne();
      if (!row && strictId) {
        throw new BadRequestException(
          `${label} "${idValue}" was not found in the MCOM taxonomy.`,
        );
      }
      return row ?? null;
    }

    if (nameValue) {
      return repository
        .createQueryBuilder('taxonomy')
        .where('lower(btrim(taxonomy.name)) = lower(btrim(:name))', {
          name: nameValue,
        })
        .andWhere('taxonomy."centralId" IS NOT NULL')
        .getOne();
    }

    return null;
  }

  /**
   * Stores stable MCOM Central Hub taxonomy IDs on the offer while keeping the
   * legacy name columns in sync. Name-only payloads are still accepted so old
   * clients and existing offers keep working; when a name matches a mirrored
   * taxonomy row its ID is attached automatically.
   */
  private async resolveTaxonomy(
    patch: Record<string, unknown>,
    existing?: PromotionalOffer | null,
  ): Promise<void> {
    const sectorIdInput = this.inputString(patch.sectorId);
    const sectorNameInput = this.inputString(patch.sector);
    if (sectorIdInput === null || sectorNameInput === null) {
      patch.sector = null;
      patch.sectorId = null;
      patch.category = null;
      patch.categoryId = null;
      patch.subCategory = null;
      patch.subCategoryId = null;
      return;
    }

    const sector = await this.findTaxonomyRow(
      this.sectorRepository,
      sectorIdInput ?? existing?.sectorId,
      sectorNameInput ?? existing?.sector,
      'Sector',
      !!sectorIdInput,
    );
    if (sector) {
      patch.sector = sector.name;
      patch.sectorId = this.taxonomyId(sector);
    } else if (sectorNameInput) {
      patch.sector = sectorNameInput;
      patch.sectorId = null;
    }

    const categoryIdInput = this.inputString(patch.categoryId);
    const categoryNameInput = this.inputString(patch.category);
    if (categoryIdInput === null || categoryNameInput === null) {
      patch.category = null;
      patch.categoryId = null;
      patch.subCategory = null;
      patch.subCategoryId = null;
      return;
    }

    const category = await this.findTaxonomyRow(
      this.categoryRepository,
      categoryIdInput ?? existing?.categoryId,
      categoryNameInput ?? existing?.category,
      'Category',
      !!categoryIdInput,
    );
    if (category && sector && category.sectorId !== sector.id) {
      throw new BadRequestException(
        'Category does not belong to the selected sector.',
      );
    }
    if (category) {
      patch.category = category.name;
      patch.categoryId = this.taxonomyId(category);
    } else if (categoryNameInput) {
      patch.category = categoryNameInput;
      patch.categoryId = null;
    }

    const subCategoryIdInput = this.inputString(patch.subCategoryId);
    const subCategoryNameInput = this.inputString(patch.subCategory);
    if (subCategoryIdInput === null || subCategoryNameInput === null) {
      patch.subCategory = null;
      patch.subCategoryId = null;
      return;
    }

    const subcategory = await this.findTaxonomyRow(
      this.subcategoryRepository,
      subCategoryIdInput ?? existing?.subCategoryId,
      subCategoryNameInput ?? existing?.subCategory,
      'Subcategory',
      !!subCategoryIdInput,
    );
    if (subcategory && category && subcategory.categoryId !== category.id) {
      throw new BadRequestException(
        'Subcategory does not belong to the selected category.',
      );
    }
    if (subcategory) {
      patch.subCategory = subcategory.name;
      patch.subCategoryId = this.taxonomyId(subcategory);
    } else if (subCategoryNameInput) {
      patch.subCategory = subCategoryNameInput;
      patch.subCategoryId = null;
    }
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
    const {
      page = 1,
      limit = 20,
      search,
      offeringType,
      status,
      availability,
      sector,
      sectorId,
      category,
      categoryId,
      subCategoryId,
    } = query;
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
    if (sectorId) {
      qb.andWhere('offer.sectorId = :sectorId', { sectorId });
    } else if (sector) {
      qb.andWhere('offer.sector = :sector', { sector });
    }
    if (categoryId) {
      qb.andWhere('offer.categoryId = :categoryId', { categoryId });
    } else if (category) {
      qb.andWhere('offer.category = :category', { category });
    }
    if (subCategoryId) {
      qb.andWhere('offer.subCategoryId = :subCategoryId', { subCategoryId });
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
    await this.resolveTaxonomy(patch);
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

    const patch = this.toPatch(dto);
    await this.resolveTaxonomy(patch, offer);
    Object.assign(offer, patch);
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
