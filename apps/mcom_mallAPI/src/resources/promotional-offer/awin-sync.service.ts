import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromotionalOffer } from './entities/promotional-offer.entity';
import { AffiliateClick } from './entities/affiliate-click.entity';
import {
  AffiliateTransaction,
  AffiliateTransactionStatus,
} from './entities/affiliate-transaction.entity';

interface AwinSyncResult {
  received: number;
  created: number;
  updated: number;
  attributed: number;
  unattributed: number;
  period: { startDate: string; endDate: string };
}

@Injectable()
export class AwinSyncService {
  private readonly logger = new Logger(AwinSyncService.name);

  constructor(
    @InjectRepository(PromotionalOffer)
    private readonly offersRepository: Repository<PromotionalOffer>,
    @InjectRepository(AffiliateClick)
    private readonly clickRepository: Repository<AffiliateClick>,
    @InjectRepository(AffiliateTransaction)
    private readonly transactionRepository: Repository<AffiliateTransaction>,
  ) {}

  async syncTransactions(
    startDateInput?: string,
    endDateInput?: string,
  ): Promise<AwinSyncResult> {    const token = process.env.AWIN_API_TOKEN;
    const publisherId = process.env.AWIN_PUBLISHER_ID;

    if (!token || !publisherId) {
      throw new BadRequestException(
        'Awin is not configured. Set AWIN_API_TOKEN and AWIN_PUBLISHER_ID to enable transaction sync.',
      );
    }

    const endDate = endDateInput
      ? new Date(endDateInput)
      : new Date();
    const startDate = startDateInput
      ? new Date(startDateInput)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      throw new BadRequestException('Invalid sync date range.');
    }

    const start = this.formatDate(startDate);
    const end = this.formatDate(endDate);
    const baseUrl =
      process.env.AWIN_API_BASE || 'https://api.awin.com';

    const response = await fetch(
      `${baseUrl}/publishers/${publisherId}/transactions/?startDate=${start}&endDate=${end}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Awin sync failed (${response.status}): ${body}`);
      throw new BadRequestException(
        `Awin transaction sync failed with status ${response.status}.`,
      );
    }

    const payload = (await response.json()) as unknown;
    const transactions = this.flattenTransactions(payload);

    let created = 0;
    let updated = 0;
    let attributed = 0;
    let unattributed = 0;

    for (const raw of transactions) {
      const externalTransactionId = this.readString(
        raw,
        ['transactionId', 'id', 'transaction_id'],
      );
      if (!externalTransactionId) continue;

      const clickRef = this.readString(raw, [
        'clickRef',
        'clickref',
        'click_ref',
      ]);
      const click = clickRef
        ? await this.clickRepository.findOne({ where: { clickRef } })
        : null;

      let businessId = click?.businessId ?? null;
      let offerId = click?.offerId ?? null;

      const advertiserId = this.readString(raw, [
        'advertiserId',
        'advertiser_id',
      ]);
      const advertiserName = this.readString(raw, [
        'advertiserName',
        'advertiser_name',
      ]);

      if (!offerId && advertiserId) {
        const offer = await this.offersRepository.findOne({
          where: { advertiserId },
        });
        if (offer) offerId = offer.id;
      }

      const status = this.normaliseStatus(
        this.readString(raw, ['commissionStatus', 'commission_status', 'status']),
      );
      const commissionAmount = this.readNumber(raw, [
        'commissionAmount',
        'commission',
        'commission_amount',
      ]);
      const saleAmount = this.readNumber(raw, [
        'saleAmount',
        'sale',
        'amount',
        'orderValue',
      ]);
      const transactionDateRaw = this.readString(raw, [
        'transactionDate',
        'date',
        'transaction_date',
      ]);
      const currency =
        this.readString(raw, ['currency', 'currencyCode', 'currency_code']) ||
        'GBP';

      if (businessId) {
        attributed += 1;
      } else {
        unattributed += 1;
      }

      let transaction = await this.transactionRepository.findOne({
        where: { externalTransactionId },
      });

      if (transaction) {
        transaction.offerId = offerId ?? transaction.offerId;
        transaction.businessId = businessId ?? transaction.businessId;
        transaction.clickId = click?.id ?? transaction.clickId;
        transaction.clickRef = clickRef ?? transaction.clickRef;
        transaction.advertiserId =
          advertiserId ?? transaction.advertiserId;
        transaction.advertiserName =
          advertiserName ?? transaction.advertiserName;
        transaction.status = status;
        transaction.rawStatus = this.readString(raw, [
          'commissionStatus',
          'status',
        ]);
        transaction.saleAmount = saleAmount;
        transaction.commissionAmount = commissionAmount;
        transaction.currency = currency;
        transaction.transactionDate = this.parseDate(transactionDateRaw);
        transaction.rawPayload = raw as Record<string, unknown>;
        await this.transactionRepository.save(transaction);
        updated += 1;
      } else {
        transaction = this.transactionRepository.create({
          externalTransactionId,
          offerId,
          businessId,
          clickId: click?.id ?? null,
          clickRef,
          advertiserId,
          advertiserName,
          status,
          rawStatus: this.readString(raw, [
            'commissionStatus',
            'status',
          ]),
          saleAmount,
          commissionAmount,
          currency,
          transactionDate: this.parseDate(transactionDateRaw),
          rawPayload: raw as Record<string, unknown>,
        });
        await this.transactionRepository.save(transaction);
        created += 1;
      }

      if (click) {
        await this.clickRepository.update(click.id, {
          attributed: true,
          transactionId: transaction.id,
        });
      }
    }

    return {
      received: transactions.length,
      created,
      updated,
      attributed,
      unattributed,
      period: { startDate: start, endDate: end },
    };
  }

  /**
   * Daily reconciliation with Awin. Silently skipped when credentials are not
   * configured so local and preview environments keep working.
   */
  @Cron('0 3 * * *')
  async scheduledSync(): Promise<void> {
    if (!process.env.AWIN_API_TOKEN || !process.env.AWIN_PUBLISHER_ID) {
      return;
    }
    try {
      const result = await this.syncTransactions();
      this.logger.log(
        `Scheduled Awin sync: ${result.received} transactions received, ${result.created} new, ${result.updated} updated.`,
      );
    } catch (error) {
      this.logger.error(
        `Scheduled Awin sync failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private flattenTransactions(payload: unknown): Record<string, unknown>[] {
    if (Array.isArray(payload)) {
      return payload.flatMap((item) => this.flattenTransactions(item));
    }

    if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>;
      if (Array.isArray(record.transactions)) {
        return record.transactions.flatMap((item) =>
          this.flattenTransactions(item),
        );
      }
      if (
        record.transactionId ||
        record.transaction_id ||
        record.id
      ) {
        return [record];
      }
    }

    return [];
  }

  private readString(
    source: Record<string, unknown>,
    keys: string[],
  ): string | undefined {
    for (const key of keys) {
      const value = source[key];
      if (value !== undefined && value !== null && value !== '') {
        return String(value);
      }
    }
    return undefined;
  }

  private readNumber(
    source: Record<string, unknown>,
    keys: string[],
  ): number | null {
    for (const key of keys) {
      const value = source[key];
      if (value === undefined || value === null || value === '') continue;
      const numeric = Number(value);
      if (Number.isFinite(numeric)) return numeric;
    }
    return null;
  }

  private normaliseStatus(status?: string): AffiliateTransactionStatus {
    const value = (status || '').toLowerCase();
    if (value.includes('approve')) return 'approved';
    if (value.includes('amend')) return 'amended';
    if (value.includes('pending')) return 'pending';
    if (
      value.includes('reject') ||
      value.includes('declin') ||
      value.includes('cancel') ||
      value.includes('revers')
    ) {
      return 'rejected';
    }
    return 'unknown';
  }

  private parseDate(value?: string): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
