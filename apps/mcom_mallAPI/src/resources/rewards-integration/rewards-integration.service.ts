import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/product.service';
import { GiftCard } from '../gift-card/entities/gift-card.entity';
import { Voucher } from '../voucher/entities/voucher.entity';
import { SavedCoupon } from '../coupon/entities/saved-coupon.entity';
import { RewardIssuanceMirror } from './entities/reward-issuance-mirror.entity';
import { RewardsClientService } from './rewards-client.service';
import { RewardsEligibilityService } from './rewards-eligibility.service';
import {
  EligibleReward,
  EligibilityLine,
  RewardIssuanceDto,
} from './interfaces/reward-issuance.interface';
import { EligibleRewardsDto } from './dto/eligible-rewards.dto';

export interface EligibleRewardsResult {
  meshEnabled: boolean;
  /** True when the rewards peer could not be reached (results are best-effort). */
  degraded: boolean;
  rewards: EligibleReward[];
}

@Injectable()
export class RewardsIntegrationService {
  private readonly logger = new Logger(RewardsIntegrationService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(GiftCard)
    private readonly giftCardRepository: Repository<GiftCard>,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(SavedCoupon)
    private readonly savedCouponRepository: Repository<SavedCoupon>,
    @InjectRepository(RewardIssuanceMirror)
    private readonly mirrorRepository: Repository<RewardIssuanceMirror>,
    private readonly productService: ProductService,
    private readonly rewardsClient: RewardsClientService,
    private readonly eligibility: RewardsEligibilityService,
  ) {}

  private async getCentralUserId(userId: string): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'centralUserId'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user.centralUserId ?? null;
  }

  /** Build eligibility lines for products in the cart/buy-now payload. */
  async buildProductLines(
    items: {
      productId: string;
      quantity: number;
      selectedVariants?: Record<string, string>;
    }[],
  ): Promise<EligibilityLine[]> {
    const productIds = items.map((i) => i.productId);
    if (productIds.length === 0) return [];

    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['business', 'business.user'],
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    const lines: EligibilityLine[] = [];
    for (const item of items) {
      const product = byId.get(item.productId);
      if (!product) continue;
      let unitPrice: number;
      try {
        unitPrice = this.productService.calculatePrice(
          product,
          item.selectedVariants || {},
        );
      } catch {
        unitPrice =
          product.salePrice !== undefined && product.salePrice !== null
            ? Number(product.salePrice)
            : Number(product.price);
      }
      lines.push({
        lineKey: `product:${product.id}`,
        kind: 'PRODUCT',
        id: product.id,
        businessId: product.business?.id,
        businessMcomUserId: product.business?.user?.centralUserId ?? undefined,
        unitPrice: Number(unitPrice),
        quantity: item.quantity,
      });
    }
    return lines;
  }

  /** Fetch a user's ISSUED reward issuances (best-effort). */
  async fetchUsableIssuances(
    centralUserId: string,
  ): Promise<{ issuances: RewardIssuanceDto[] | null }> {
    const result = await this.rewardsClient.tryListUserIssuances(
      centralUserId,
      { status: 'ISSUED', limit: 100 },
    );
    return { issuances: result ? result.data : null };
  }

  /**
   * Which of the user's rewards can discount which of the supplied lines.
   * Server-authoritative; the client should only render this.
   */
  async getEligibleRewards(
    userId: string,
    dto: EligibleRewardsDto,
  ): Promise<EligibleRewardsResult> {
    const meshEnabled = this.rewardsClient.isEnabled();
    if (!meshEnabled) {
      return { meshEnabled: false, degraded: false, rewards: [] };
    }

    const centralUserId = await this.getCentralUserId(userId);
    if (!centralUserId) {
      return { meshEnabled: true, degraded: false, rewards: [] };
    }

    const lines = await this.buildProductLines(dto.items || []);
    for (const booking of dto.serviceBookings || []) {
      lines.push({
        lineKey: `service:${booking.serviceId}`,
        kind: 'SERVICE',
        id: booking.serviceId,
        unitPrice: Number(booking.price ?? 0),
        quantity: Number(booking.quantity ?? 1),
      });
    }

    const { issuances } = await this.fetchUsableIssuances(centralUserId);
    if (issuances === null) {
      return { meshEnabled: true, degraded: true, rewards: [] };
    }

    const rewards = this.eligibility.evaluate(issuances, lines);
    return { meshEnabled: true, degraded: false, rewards };
  }

  /**
   * Aggregated wallet for the mall "My Rewards" surface: rewards issued by
   * MCOM Rewards plus instruments held locally by the mall.
   */
  async getMyRewards(user: { id: string; centralUserId?: string | null }) {
    const [giftCards, vouchers, savedCoupons] = await Promise.all([
      this.giftCardRepository
        .find({
          where: [{ ownerId: user.id }, { purchaserId: user.id }],
          relations: ['purchaseBusiness', 'template'],
          order: { created_at: 'DESC' },
        })
        .catch(() => [] as GiftCard[]),
      this.voucherRepository
        .find({
          where: [{ buyer: { id: user.id } }, { recipient: { id: user.id } }],
          relations: ['owner', 'voucherProduct'],
        })
        .catch(() => [] as Voucher[]),
      this.savedCouponRepository
        .find({
          where: { user: { id: user.id } },
          relations: ['coupon', 'coupon.campaign', 'coupon.business'],
          order: { savedAt: 'DESC' },
        })
        .catch(() => [] as SavedCoupon[]),
    ]);

    let partnerRewards: RewardIssuanceDto[] = [];
    let degraded = false;
    if (this.rewardsClient.isEnabled() && user.centralUserId) {
      const result = await this.rewardsClient.tryListUserIssuances(
        user.centralUserId,
        { limit: 100 },
      );
      if (result) {
        partnerRewards = result.data;
      } else {
        degraded = true;
        const mirrored = await this.mirrorRepository
          .find({
            where: { recipientMcomUserId: user.centralUserId },
            order: { createdAt: 'DESC' },
            take: 100,
          })
          .catch(() => [] as RewardIssuanceMirror[]);
        partnerRewards = mirrored.map((row) => this.mirrorToIssuance(row));
      }
    }

    return {
      meshEnabled: this.rewardsClient.isEnabled(),
      degraded,
      partnerRewards,
      giftCards,
      vouchers,
      coupons: savedCoupons,
    };
  }

  private mirrorToIssuance(row: RewardIssuanceMirror): RewardIssuanceDto {
    return {
      id: row.id,
      rewardId: row.rewardId ?? null,
      businessRewardId: row.businessRewardId ?? null,
      rewardTitle: row.rewardTitle ?? null,
      issuerClientId: row.issuerClientId,
      recipient: {
        mcomUserId: row.recipientMcomUserId ?? null,
        email: row.recipientEmail ?? null,
      },
      code: row.code ?? null,
      status: row.status,
      rewardType: row.rewardType ?? null,
      value: Number(row.value),
      quantity: Number(row.quantity),
      expiresAt: row.expiresAt ? new Date(row.expiresAt).toISOString() : null,
      redeemedAt: row.redeemedAt
        ? new Date(row.redeemedAt).toISOString()
        : null,
      revokedAt: row.revokedAt ? new Date(row.revokedAt).toISOString() : null,
      metadata: row.metadata ?? null,
      createdAt: row.createdAt
        ? new Date(row.createdAt).toISOString()
        : undefined,
      updatedAt: row.updatedAt
        ? new Date(row.updatedAt).toISOString()
        : undefined,
    };
  }

  /** Test seam: evaluate raw issuances against lines. */
  evaluateIssuances(
    issuances: RewardIssuanceDto[],
    lines: EligibilityLine[],
  ): EligibleReward[] {
    return this.eligibility.evaluate(issuances, lines);
  }
}
