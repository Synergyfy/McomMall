import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingRate } from './entities/shipping-rate.entity';
import { RoyalMailService } from './royal-mail.service';

export interface ShippingItemInput {
  quantity: number;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

export interface ShippingPricingResult {
  fee: number;
  source: 'api' | 'db' | 'default';
  serviceCode: string;
}

const DEFAULT_SERVICE_CODES: Record<string, string> = {
  royalmail: 'TRM48',
  royalmail_express: 'TRM24',
  express: 'TRM24',
  dpd: 'DPD',
  evri: 'EVRI',
  standard: 'STD',
};

@Injectable()
export class ShippingPricingService {
  private readonly logger = new Logger(ShippingPricingService.name);

  constructor(
    @InjectRepository(ShippingRate)
    private readonly shippingRateRepository: Repository<ShippingRate>,
    private readonly royalMailService: RoyalMailService,
  ) {}

  private resolveServiceCode(carrierCode?: string): string {
    if (!carrierCode) return 'STD';
    return DEFAULT_SERVICE_CODES[carrierCode] || carrierCode;
  }

  private totalWeight(items: ShippingItemInput[]): number {
    return items.reduce(
      (sum, item) => sum + (item.weightKg || 0) * item.quantity,
      0,
    );
  }

  async getShippingFee(
    carrierCode: string,
    items: ShippingItemInput[],
    destinationPostcode?: string,
  ): Promise<ShippingPricingResult> {
    const serviceCode = this.resolveServiceCode(carrierCode);
    const weightKg = this.totalWeight(items);

    // 1. Try the Royal Mail live pricing API for royal mail carriers.
    if (carrierCode?.startsWith('royalmail') || carrierCode === 'express') {
      try {
        const apiFee = await this.royalMailService.getPriceQuote({
          weightKg: Math.max(weightKg, 0.1),
          serviceCode,
          destinationPostcode,
        });
        if (apiFee !== null) {
          return { fee: apiFee, source: 'api', serviceCode };
        }
      } catch (error: unknown) {
        this.logger.warn(
          `Royal Mail price quote threw; falling back to configured rates: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    // 2. Fall back to DB-configurable rates.
    let rate: ShippingRate | null = null;
    try {
      rate = await this.shippingRateRepository
        .createQueryBuilder('rate')
        .where('rate.carrierCode = :carrierCode', {
          carrierCode: carrierCode || 'standard',
        })
        .andWhere('rate.isActive = :isActive', { isActive: true })
        .andWhere('rate.minWeightKg <= :weightKg', {
          weightKg: Math.max(weightKg, 0),
        })
        .andWhere('rate.maxWeightKg >= :weightKg', {
          weightKg: Math.max(weightKg, 0),
        })
        .orderBy('rate.minWeightKg', 'DESC')
        .getOne();
    } catch (error: unknown) {
      this.logger.warn(
        `Shipping rate lookup failed (${carrierCode}, ${weightKg}kg); using default rate: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    if (rate) {
      return {
        fee: rate.price,
        source: 'db',
        serviceCode: rate.serviceCode || serviceCode,
      };
    }

    // 3. Final default fallback so checkout never fails.
    this.logger.warn(
      `No shipping rate configured for carrier "${carrierCode}" at ${weightKg}kg; using default rate.`,
    );
    const defaultFee = this.defaultFee(carrierCode);
    return { fee: defaultFee, source: 'default', serviceCode };
  }

  private defaultFee(carrierCode?: string): number {
    if (carrierCode === 'royalmail' || carrierCode === 'express') return 4.5;
    if (carrierCode === 'royalmail_express') return 6.99;
    if (carrierCode === 'dpd' || carrierCode === 'evri') return 5.49;
    return 3.99;
  }
}
