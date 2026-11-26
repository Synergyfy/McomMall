import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import {
  PromotionalOffer,
  PromotionalOfferingType,
} from './entities/promotional-offer.entity';
import { PromotionalOfferBusiness } from './entities/promotional-offer-business.entity';
import { BusinessPromotionalOffer } from './entities/business-promotional-offer.entity';
import { AffiliateClick } from './entities/affiliate-click.entity';
import { AffiliateTransaction } from './entities/affiliate-transaction.entity';
import { PublicPromotionalOfferQueryDto } from './dto/promotional-offer-query.dto';

export interface ClickContext {
  businessId?: string;
  campaignId?: string;
  source?: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class PromotionalOffersService {
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
  ) {}

  private async getBusinessForUser(userId: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!business) {
      throw new BadRequestException(
        'No business profile is linked to this account.',
      );
    }
    return business;
  }

  private assertLiveOffer(offer: PromotionalOffer | null): PromotionalOffer {
    if (!offer) {
      throw new NotFoundException('Promotional offer not found');
    }
    if (offer.status !== 'active') {
      throw new NotFoundException('Promotional offer is not available');
    }
    const now = Date.now();
    if (offer.startDate && new Date(offer.startDate).getTime() > now) {
      throw new NotFoundException('Promotional offer is not live yet');
    }
    if (offer.endDate && new Date(offer.endDate).getTime() < now) {
      throw new NotFoundException('Promotional offer has ended');
    }
    return offer;
  }

  private async isOfferAvailableToBusiness(
    offer: PromotionalOffer,
    businessId: string,
  ): Promise<boolean> {
    if (offer.availability === 'all') return true;

    const selected = await this.offerBusinessRepository.findOne({
      where: { offerId: offer.id, businessId },
    });
    if (selected) return true;

    const imported = await this.businessOfferRepository.findOne({
      where: { offerId: offer.id, businessId, isActive: true },
    });
    return !!imported;
  }

  /**
   * Offers imported by a business and shown on its public storefront.
   */
  async getStorefrontOffers(
    businessId: string,
    offeringType?: PromotionalOfferingType,
  ) {
    const qb = this.offersRepository
      .createQueryBuilder('offer')
      .innerJoin(
        BusinessPromotionalOffer,
        'bpo',
        'bpo.offerId = offer.id AND bpo.businessId = :businessId AND bpo.isActive = true',
        { businessId },
      )
      .where('offer.status = :status', { status: 'active' })
      .andWhere('(offer.startDate IS NULL OR offer.startDate <= NOW())')
      .andWhere('(offer.endDate IS NULL OR offer.endDate >= NOW())');

    if (offeringType) {
      qb.andWhere('offer.offeringType = :offeringType', { offeringType });
    }

    qb.orderBy('offer.isFeatured', 'DESC')
      .addOrderBy('offer.displayOrder', 'ASC')
      .addOrderBy('offer.created_at', 'DESC');

    return qb.getMany();
  }

  /**
   * Public catalogue used by the marketplace and business storefronts.
   *
   * Only offers claimed (imported) by a live business are returned. Each row is
   * a claim, so the same external offer can appear under every business that
   * promotes it, and the business is shown as the seller.
   */
  async getPublicOffers(query: PublicPromotionalOfferQueryDto) {
    const {
      page = 1,
      limit = 24,
      offeringType,
      search,
      sector,
      sectorId,
      category,
      categoryId,
      subCategoryId,
      businessId,
    } = query;

    const qb = this.businessOfferRepository
      .createQueryBuilder('claim')
      .innerJoinAndSelect('claim.offer', 'offer')
      .innerJoinAndSelect('claim.business', 'business')
      .where('claim.isActive = true')
      .andWhere('business.status = :businessStatus', {
        businessStatus: 'published',
      })
      .andWhere('offer.status = :status', { status: 'active' })
      .andWhere('(offer.startDate IS NULL OR offer.startDate <= NOW())')
      .andWhere('(offer.endDate IS NULL OR offer.endDate >= NOW())');

    if (businessId) {
      qb.andWhere('claim.businessId = :businessId', { businessId });
    }
    if (offeringType) {
      qb.andWhere('offer.offeringType = :offeringType', { offeringType });
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
    if (search) {
      qb.andWhere(
        '(offer.name ILIKE :search OR offer.description ILIKE :search OR offer.shortDescription ILIKE :search OR offer.advertiserName ILIKE :search OR business.businessName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('offer.isFeatured', 'DESC')
      .addOrderBy('offer.displayOrder', 'ASC')
      .addOrderBy('claim.importedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [claims, total] = await qb.getManyAndCount();

    return {
      data: claims.map((claim) => ({
        ...claim.offer,
        businessId: claim.businessId,
        businessName: claim.business?.businessName || 'Business',
        claimedAt: claim.importedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getPublicOffer(id: string) {
    const offer = await this.offersRepository.findOne({ where: { id } });
    return this.assertLiveOffer(offer);
  }

  /**
   * Catalogue shown inside the business dashboard. Includes every live offer
   * the business is eligible for plus an `imported` flag.
   */
  async getBusinessCatalogue(
    userId: string,
    offeringType?: PromotionalOfferingType,
  ) {
    const business = await this.getBusinessForUser(userId);

    const qb = this.offersRepository
      .createQueryBuilder('offer')
      .where('offer.status = :status', { status: 'active' })
      .andWhere('(offer.startDate IS NULL OR offer.startDate <= NOW())')
      .andWhere('(offer.endDate IS NULL OR offer.endDate >= NOW())')
      .andWhere(
        `(
          offer.availability = :all
          OR EXISTS (
            SELECT 1 FROM promotional_offer_businesses pob
            WHERE pob."offerId" = offer.id AND pob."businessId" = :businessId
          )
          OR EXISTS (
            SELECT 1 FROM business_promotional_offers bpo
            WHERE bpo."offerId" = offer.id
              AND bpo."businessId" = :businessId
              AND bpo."isActive" = true
          )
        )`,
        { all: 'all', businessId: business.id },
      );

    if (offeringType) {
      qb.andWhere('offer.offeringType = :offeringType', { offeringType });
    }

    qb.orderBy('offer.isFeatured', 'DESC')
      .addOrderBy('offer.displayOrder', 'ASC')
      .addOrderBy('offer.created_at', 'DESC');

    const [offers, imports] = await Promise.all([
      qb.getMany(),
      this.businessOfferRepository.find({
        where: { businessId: business.id },
      }),
    ]);

    const importMap = new Map(imports.map((item) => [item.offerId, item]));

    return {
      businessId: business.id,
      businessName: business.businessName,
      data: offers.map((offer) => {
        const importRecord = importMap.get(offer.id);
        return {
          ...offer,
          imported: !!importRecord?.isActive,
          importedAt: importRecord?.isActive
            ? importRecord.importedAt
            : null,
          removedAt: importRecord?.removedAt ?? null,
        };
      }),
      total: offers.length,
      importedCount: offers.filter(
        (offer) => importMap.get(offer.id)?.isActive,
      ).length,
    };
  }

  async importOffer(userId: string, offerId: string) {
    const business = await this.getBusinessForUser(userId);
    const offer = this.assertLiveOffer(
      await this.offersRepository.findOne({ where: { id: offerId } }),
    );

    const available = await this.isOfferAvailableToBusiness(
      offer,
      business.id,
    );
    if (!available) {
      throw new ForbiddenException(
        'This promotional offer has not been made available to your business.',
      );
    }

    let record = await this.businessOfferRepository.findOne({
      where: { businessId: business.id, offerId },
    });

    if (record) {
      record.isActive = true;
      record.removedAt = null;
      record.importedAt = new Date();
      record.importedByUserId = userId;
    } else {
      record = this.businessOfferRepository.create({
        businessId: business.id,
        offerId,
        isActive: true,
        importedAt: new Date(),
        importedByUserId: userId,
      });
    }

    return this.businessOfferRepository.save(record);
  }

  async removeImport(userId: string, offerId: string) {
    const business = await this.getBusinessForUser(userId);
    const record = await this.businessOfferRepository.findOne({
      where: { businessId: business.id, offerId },
    });

    if (!record) {
      throw new NotFoundException(
        'This promotional offer is not imported into your storefront.',
      );
    }

    record.isActive = false;
    record.removedAt = new Date();
    await this.businessOfferRepository.save(record);

    return { message: 'Promotional offer removed from your storefront.' };
  }

  /**
   * Records a click, attaches the business reference, and returns the
   * advertiser destination wrapped in the platform's Awin tracking link.
   */
  async recordClick(offerId: string, context: ClickContext) {
    const offer = this.assertLiveOffer(
      await this.offersRepository.findOne({ where: { id: offerId } }),
    );

    let businessId: string | undefined;
    if (context.businessId) {
      const business = await this.businessRepository.findOne({
        where: { id: context.businessId },
      });
      if (!business) {
        throw new NotFoundException('Business not found');
      }
      const available = await this.isOfferAvailableToBusiness(
        offer,
        business.id,
      );
      if (!available) {
        throw new ForbiddenException(
          'This business cannot promote this promotional offer.',
        );
      }
      businessId = business.id;
    }

    const clickRef = `mcom-${businessId || 'platform'}-${randomBytes(8).toString('hex')}`;
    const trackingUrl = this.buildTrackingUrl(offer, clickRef, businessId);

    const click = this.clickRepository.create({
      offerId: offer.id,
      businessId: businessId ?? null,
      campaignId: context.campaignId ?? null,
      clickRef,
      source: context.source ?? 'marketplace',
      destinationUrl: offer.destinationUrl,
      trackingUrl,
      referrer: context.referrer?.slice(0, 2048),
      userAgent: context.userAgent?.slice(0, 512),
      ipHash: this.hashIp(context.ip),
      attributed: false,
    });
    const saved = await this.clickRepository.save(click);

    return { url: trackingUrl, clickRef, click: saved };
  }

  private hashIp(ip?: string): string | undefined {
    if (!ip) return undefined;
    const salt = process.env.AFFILIATE_IP_HASH_SALT || 'mcom-mall';
    return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
  }

  private buildTrackingUrl(
    offer: PromotionalOffer,
    clickRef: string,
    businessId?: string,
  ): string {
    if (offer.affiliateTrackingUrl) {
      if (offer.affiliateTrackingUrl.includes('{clickref}')) {
        return offer.affiliateTrackingUrl.replace(
          /\{clickref\}/g,
          encodeURIComponent(clickRef),
        );
      }
      return this.appendInternalReference(
        offer.affiliateTrackingUrl,
        clickRef,
        businessId,
      );
    }

    const publisherId = process.env.AWIN_PUBLISHER_ID;
    if (offer.advertiserId && publisherId) {
      const base =
        process.env.AWIN_DEEPLINK_BASE || 'https://www.awin1.com/cread.php';
      const params = new URLSearchParams({
        awinmid: offer.advertiserId,
        awinaffid: publisherId,
        clickref: clickRef,
        ued: offer.destinationUrl,
      });
      return `${base}?${params.toString()}`;
    }

    // Awin is optional. Until the publisher account is connected, still send
    // the advertiser a reference so the click can be matched to the business.
    return this.appendInternalReference(
      offer.destinationUrl,
      clickRef,
      businessId,
    );
  }

  private appendInternalReference(
    url: string,
    clickRef: string,
    businessId?: string,
  ): string {
    try {
      const target = new URL(url);
      // Simple business reference for advertisers/affiliates to read.
      target.searchParams.set('ref', businessId || 'platform');
      // Internal unique click reference used for reconciliation.
      target.searchParams.set('mcom_ref', clickRef);
      if (businessId) {
        target.searchParams.set('mcom_business_id', businessId);
      }
      return target.toString();
    } catch {
      return url;
    }
  }

  /**
   * Business-scoped affiliate performance. Only the business's own clicks and
   * transactions are returned.
   */
  async getBusinessPerformance(userId: string) {
    const business = await this.getBusinessForUser(userId);

    const [imports, clicks, transactions, totalClicks] = await Promise.all([
      this.businessOfferRepository.find({
        where: { businessId: business.id, isActive: true },
        relations: ['offer'],
        withDeleted: true,
      }),
      this.clickRepository.find({
        where: { businessId: business.id },
        order: { created_at: 'DESC' },
        take: 200,
      }),
      this.transactionRepository.find({
        where: { businessId: business.id },
        relations: ['offer'],
        order: { created_at: 'DESC' },
        withDeleted: true,
      }),
      this.clickRepository.count({ where: { businessId: business.id } }),
    ]);

    const clickGroups = await this.clickRepository
      .createQueryBuilder('click')
      .select('click.offerId', 'offerId')
      .addSelect('COUNT(*)', 'count')
      .where('click.businessId = :businessId', { businessId: business.id })
      .groupBy('click.offerId')
      .getRawMany<{ offerId: string; count: string }>();

    const commissionByOffer = new Map<
      string,
      { approved: number; pending: number; rejected: number; transactions: number }
    >();

    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      amended: 0,
    };

    let approvedCommission = 0;
    let pendingCommission = 0;
    let businessEarnings = 0;

    for (const transaction of transactions) {
      const commission = Number(transaction.commissionAmount || 0);
      const rate = Number(transaction.offer?.businessCommissionRate || 0) / 100;

      if (transaction.status === 'approved' || transaction.status === 'amended') {
        approvedCommission += commission;
        businessEarnings += commission * rate;
        statusCounts.approved += 1;
      } else if (transaction.status === 'pending') {
        pendingCommission += commission;
        statusCounts.pending += 1;
      } else if (transaction.status === 'rejected') {
        statusCounts.rejected += 1;
      }

      const key = transaction.offerId || 'unattributed';
      const bucket = commissionByOffer.get(key) ?? {
        approved: 0,
        pending: 0,
        rejected: 0,
        transactions: 0,
      };
      bucket.transactions += 1;
      if (transaction.status === 'approved' || transaction.status === 'amended') {
        bucket.approved += commission;
      } else if (transaction.status === 'pending') {
        bucket.pending += commission;
      } else if (transaction.status === 'rejected') {
        bucket.rejected += commission;
      }
      commissionByOffer.set(key, bucket);
    }

    const clicksByOffer = new Map<string, number>();
    for (const group of clickGroups) {
      if (!group.offerId) continue;
      clicksByOffer.set(group.offerId, Number(group.count));
    }

    const byOffer = imports.map((importRecord) => {
      const offer = importRecord.offer;
      const bucket = commissionByOffer.get(importRecord.offerId) ?? {
        approved: 0,
        pending: 0,
        rejected: 0,
        transactions: 0,
      };
      const offerClicks = clicksByOffer.get(importRecord.offerId) || 0;
      return {
        offerId: importRecord.offerId,
        name: offer?.name || 'Promotional offer',
        offeringType: offer?.offeringType || 'product',
        advertiserName: offer?.advertiserName || null,
        images: offer?.images || [],
        importedAt: importRecord.importedAt,
        clicks: offerClicks,
        transactions: bucket.transactions,
        approvedCommission: bucket.approved,
        pendingCommission: bucket.pending,
        rejectedCommission: bucket.rejected,
        conversionRate: offerClicks
          ? Number(((bucket.transactions / offerClicks) * 100).toFixed(2))
          : 0,
      };
    });

    const totalClicksForBusiness = totalClicks;

    return {
      businessId: business.id,
      businessName: business.businessName,
      summary: {
        promotedOffers: imports.length,
        totalClicks: totalClicksForBusiness,
        transactions: transactions.length,
        pendingTransactions: statusCounts.pending,
        approvedTransactions: statusCounts.approved,
        rejectedTransactions: statusCounts.rejected,
        approvedCommission: Number(approvedCommission.toFixed(2)),
        pendingCommission: Number(pendingCommission.toFixed(2)),
        businessEarnings: Number(businessEarnings.toFixed(2)),
        conversionRate: totalClicksForBusiness
          ? Number(
              ((transactions.length / totalClicksForBusiness) * 100).toFixed(2),
            )
          : 0,
      },
      byOffer,
      recentClicks: clicks.slice(0, 20),
      recentTransactions: transactions.slice(0, 20),
    };
  }
}
