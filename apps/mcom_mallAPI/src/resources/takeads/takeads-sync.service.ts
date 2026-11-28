import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { ResolveTakeadsLinkDto } from './dto/takeads-offer.dto';
import { TakeadsClient } from './takeads.client';
import {
  mapAction,
  mapClickReport,
  mapCoupon,
  mapMerchant,
  isSafeHttpUrl,
  RawRecord,
} from './takeads.mapper';
import { TakeadsAction } from './entities/takeads-action.entity';
import { TakeadsClickReport } from './entities/takeads-click-report.entity';
import { TakeadsCoupon } from './entities/takeads-coupon.entity';
import { TakeadsMerchant } from './entities/takeads-merchant.entity';
import { TakeadsOffer } from './entities/takeads-offer.entity';
import {
  TakeadsSyncRun,
  TakeadsSyncRunType,
} from './entities/takeads-sync-run.entity';
import {
  TAKEADS_SUBID_MAX_LENGTH,
  TAKEADS_SUBID_PREFIX,
} from './takeads.constants';

export interface SyncResult {
  type: TakeadsSyncRunType;
  received: number;
  created: number;
  updated: number;
  failed: number;
}

@Injectable()
export class TakeadsSyncService {
  private readonly logger = new Logger(TakeadsSyncService.name);

  constructor(
    private readonly client: TakeadsClient,
    @InjectRepository(TakeadsMerchant)
    private readonly merchantRepository: Repository<TakeadsMerchant>,
    @InjectRepository(TakeadsCoupon)
    private readonly couponRepository: Repository<TakeadsCoupon>,
    @InjectRepository(TakeadsOffer)
    private readonly offerRepository: Repository<TakeadsOffer>,
    @InjectRepository(TakeadsClickReport)
    private readonly clickReportRepository: Repository<TakeadsClickReport>,
    @InjectRepository(TakeadsAction)
    private readonly actionRepository: Repository<TakeadsAction>,
    @InjectRepository(TakeadsSyncRun)
    private readonly syncRunRepository: Repository<TakeadsSyncRun>,
  ) {}

  get enabled(): boolean {
    return process.env.TAKEADS_SYNC_ENABLED !== 'false';
  }

  async syncAll(): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    results.push(await this.syncMerchants());
    results.push(await this.syncCoupons());
    results.push(await this.syncReports());
    return results;
  }

  async syncMerchants(): Promise<SyncResult> {
    return this.run('merchants', async () => {
      const rows = await this.client.fetchAllMerchants({ limit: 500 });
      let created = 0;
      let updated = 0;
      let failed = 0;

      for (const raw of rows) {
        const mapped = mapMerchant(raw);
        if (!mapped) {
          failed += 1;
          continue;
        }

        const existing = await this.merchantRepository.findOne({
          where: { externalMerchantId: mapped.externalMerchantId },
        });

        if (existing) {
          Object.assign(existing, mapped);
          await this.merchantRepository.save(existing);
          updated += 1;
        } else {
          await this.merchantRepository.save(
            this.merchantRepository.create(mapped),
          );
          created += 1;
        }
      }

      return { received: rows.length, created, updated, failed };
    });
  }

  async syncCoupons(): Promise<SyncResult> {
    return this.run('coupons', async () => {
      // TakeAds caps the coupon catalog at 100 rows per page.
      const rows = await this.client.fetchAllCoupons({ limit: 100 });
      const merchants = await this.merchantRepository.find();
      const merchantIdByExternal = new Map(
        merchants.map((merchant) => [
          merchant.externalMerchantId,
          merchant.id,
        ]),
      );

      let created = 0;
      let updated = 0;
      let failed = 0;

      for (const raw of rows) {
        const mapped = mapCoupon(raw);
        if (!mapped) {
          failed += 1;
          continue;
        }

        const payload = {
          ...mapped,
          merchantId: mapped.externalMerchantId
            ? merchantIdByExternal.get(mapped.externalMerchantId) ?? null
            : null,
        };

        const existing = await this.couponRepository.findOne({
          where: { externalCouponId: mapped.externalCouponId },
        });

        if (existing) {
          Object.assign(existing, payload);
          await this.couponRepository.save(existing);
          updated += 1;
        } else {
          await this.couponRepository.save(
            this.couponRepository.create(payload),
          );
          created += 1;
        }
      }

      return { received: rows.length, created, updated, failed };
    });
  }

  /**
   * Pull the last `days` of click aggregates and action records. Rows are
   * upserted so status corrections and late updates replace earlier values.
   */
  async syncReports(days = 7): Promise<SyncResult> {
    return this.run('reports', async () => {
      const now = new Date();
      const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const dateFrom = this.formatDate(from);
      const dateTo = this.formatDate(now);

      const clickRows = await this.client.fetchAllClickReports({
        dateFrom,
        dateTo,
      });
      const actionRows = await this.client.fetchAllActions({
        updatedAtFrom: from.toISOString(),
        updatedAtTo: now.toISOString(),
        limit: 500,
      });

      let created = 0;
      let updated = 0;
      let failed = 0;

      for (const raw of clickRows) {
        const mapped = mapClickReport(raw);
        if (!mapped) {
          failed += 1;
          continue;
        }
        const existing = await this.clickReportRepository.findOne({
          where: { reportKey: mapped.reportKey },
        });
        if (existing) {
          Object.assign(existing, mapped);
          await this.clickReportRepository.save(existing);
          updated += 1;
        } else {
          await this.clickReportRepository.save(
            this.clickReportRepository.create(mapped),
          );
          created += 1;
        }
      }

      for (const raw of actionRows) {
        const mapped = mapAction(raw);
        if (!mapped) {
          failed += 1;
          continue;
        }
        const existing = await this.actionRepository.findOne({
          where: { actionId: mapped.actionId },
        });
        if (existing) {
          Object.assign(existing, mapped);
          await this.actionRepository.save(existing);
          updated += 1;
        } else {
          await this.actionRepository.save(
            this.actionRepository.create(mapped),
          );
          created += 1;
        }
      }

      return {
        received: clickRows.length + actionRows.length,
        created,
        updated,
        failed,
      };
    });
  }

  /**
   * Resolve an offer's destination URL into a TakeAds tracking link and store
   * it. An empty `data` response means there is no eligible offer; that must
   * never be published as a monetised item.
   */
  async resolveOfferLink(offerId: string): Promise<TakeadsOffer> {
    const offer = await this.offerRepository.findOne({ where: { id: offerId } });
    if (!offer) {
      throw new NotFoundException('TakeAds offer not found');
    }

    if (!offer.subId) {
      offer.subId = await this.generateSubId();
    }

    // Coupon offers can already carry the tracking link supplied by TakeAds.
    // Re-resolving that tracking URL is not supported and is unnecessary.
    if (isSafeHttpUrl(offer.resolvedTrackingUrl)) {
      return offer;
    }

    const response = await this.client.resolveLinks(
      [offer.destinationUrl],
      offer.subId,
      true,
    );

    const match = (response.data ?? []).find((item: RawRecord) =>
      isSafeHttpUrl(item.trackingLink),
    );

    if (!match) {
      throw new BadRequestException(
        'TakeAds did not return an eligible offer for this destination URL.',
      );
    }

    offer.resolvedTrackingUrl = String(match.trackingLink);
    offer.linkResolvedAt = new Date();
    if (!offer.images?.length && typeof match.imageUrl === 'string') {
      offer.images = [match.imageUrl];
      offer.imageSource = offer.imageSource || 'takeads-resolve';
    }

    return this.offerRepository.save(offer);
  }

  /**
   * Resolve a product URL before an MCOM offer is created. This keeps a failed
   * resolution from leaving a publishable-looking draft behind, and preserves
   * the returned subId so it can identify this exact offer and placement when
   * TakeAds reports clicks and actions.
   */
  async resolveUrl(dto: ResolveTakeadsLinkDto): Promise<{
    destinationUrl: string;
    resolvedTrackingUrl: string;
    imageUrl?: string;
    subId: string;
  }> {
    if (!isSafeHttpUrl(dto.destinationUrl)) {
      throw new BadRequestException('A safe destination URL is required.');
    }

    const merchant = await this.merchantRepository.findOne({
      where: { externalMerchantId: dto.externalMerchantId },
    });
    if (!merchant || merchant.mcomStatus !== 'accepted') {
      throw new BadRequestException(
        'Only an approved merchant can provide affiliate products.',
      );
    }
    if (!merchant.isActive) {
      throw new BadRequestException(
        'This merchant is inactive upstream and cannot provide products.',
      );
    }

    const subId = await this.generateSubId(dto.placement);
    const response = await this.client.resolveLinks(
      [dto.destinationUrl],
      subId,
      true,
    );
    const match = (response.data ?? []).find((item: RawRecord) =>
      isSafeHttpUrl(item.trackingLink),
    );
    if (!match) {
      throw new BadRequestException(
        'TakeAds did not return an eligible affiliate link for this URL.',
      );
    }

    return {
      destinationUrl: dto.destinationUrl,
      resolvedTrackingUrl: String(match.trackingLink),
      imageUrl:
        typeof match.imageUrl === 'string' && isSafeHttpUrl(match.imageUrl)
          ? match.imageUrl
          : undefined,
      subId,
    };
  }

  /**
   * Keep the subId short enough for both the resolver and click reports, and
   * include the placement so TakeAds actions can be attributed beyond the
   * offer itself. Only safe characters are used.
   */
  async generateSubId(placement?: string): Promise<string> {
    const safePlacement = (placement ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '')
      .slice(0, 8);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const suffix = randomBytes(4).toString('hex');
      const candidate = safePlacement
        ? `${TAKEADS_SUBID_PREFIX}${safePlacement}_${suffix}`
        : `${TAKEADS_SUBID_PREFIX}${randomBytes(5).toString('hex')}`;
      if (candidate.length > TAKEADS_SUBID_MAX_LENGTH) continue;
      const exists = await this.offerRepository.findOne({
        where: { subId: candidate },
      });
      if (!exists) return candidate;
    }
    throw new BadRequestException('Could not allocate a TakeAds subId.');
  }

  @Cron('30 2 * * *')
  async scheduledMerchantSync(): Promise<void> {
    if (!this.enabled || !this.client.isPlatformConfigured) return;
    try {
      const result = await this.syncMerchants();
      this.logger.log(
        `TakeAds merchant sync: ${result.received} received, ${result.created} new, ${result.updated} updated.`,
      );
    } catch (error) {
      this.logger.error(
        `TakeAds merchant sync failed: ${this.errorMessage(error)}`,
      );
    }
  }

  @Cron('40 2 * * *')
  async scheduledCouponSync(): Promise<void> {
    if (!this.enabled || !this.client.isPlatformConfigured) return;
    try {
      const result = await this.syncCoupons();
      this.logger.log(
        `TakeAds coupon sync: ${result.received} received, ${result.created} new, ${result.updated} updated.`,
      );
    } catch (error) {
      this.logger.error(
        `TakeAds coupon sync failed: ${this.errorMessage(error)}`,
      );
    }
  }

  @Cron('30 3 * * *')
  async scheduledReportSync(): Promise<void> {
    // Reporting uses a separate account key; do not poll with the platform
    // key, which is rejected by the stats API.
    if (!this.enabled || !this.client.hasDedicatedAccountKey) return;
    try {
      const result = await this.syncReports();
      this.logger.log(
        `TakeAds report sync: ${result.received} records, ${result.created} new, ${result.updated} updated.`,
      );
    } catch (error) {
      this.logger.error(
        `TakeAds report sync failed: ${this.errorMessage(error)}`,
      );
    }
  }

  private async run(
    type: TakeadsSyncRunType,
    work: () => Promise<Omit<SyncResult, 'type'>>,
  ): Promise<SyncResult> {
    const run = await this.syncRunRepository.save(
      this.syncRunRepository.create({
        type,
        status: 'running',
        startedAt: new Date(),
      }),
    );

    try {
      const result = await work();
      await this.syncRunRepository.update(run.id, {
        status: 'success',
        finishedAt: new Date(),
        itemsReceived: result.received,
        itemsCreated: result.created,
        itemsUpdated: result.updated,
        itemsFailed: result.failed,
      });
      return { type, ...result };
    } catch (error) {
      await this.syncRunRepository.update(run.id, {
        status: 'failed',
        finishedAt: new Date(),
        errorMessage: this.errorMessage(error),
      });
      throw error;
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
