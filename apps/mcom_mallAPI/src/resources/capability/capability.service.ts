import {
  Injectable,
  ForbiddenException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { MembershipService } from '../membership/membership.service';
import { TierConfig } from '../tier/interfaces/tier-config.interface';
import { ListingsService } from '../listings/listing.service';
import { ProductService } from '../product/product.service';
import { ServicesService } from '../services/services.service';
import { ActivityTimerService } from '../activity-timer/activity-timer.service';
import { GiftCardService } from '../gift-card/gift-card.service';
import { CouponProductService } from '../coupon/coupon-product.service';
import { PromotionService } from '../promotion/promotion.service';
import { TierService } from '../tier/tier.service';

export enum ActionType {
  REQUIRE_TIER = 'REQUIRE_TIER',
  CREATE_LISTING = 'CREATE_LISTING',
  CREATE_PRODUCT = 'CREATE_PRODUCT',
  CREATE_SERVICE = 'CREATE_SERVICE',
  CAN_SELL_PRODUCTS = 'CAN_SELL_PRODUCTS',
  CAN_SELL_SERVICES = 'CAN_SELL_SERVICES',
  CREATE_GIFT_CARD_TEMPLATE = 'CREATE_GIFT_CARD_TEMPLATE',
  CREATE_COUPON_TEMPLATE = 'CREATE_COUPON_TEMPLATE',
  CREATE_LOYALTY_PROGRAM = 'CREATE_LOYALTY_PROGRAM',
  ACCESS_ADVANCED_ANALYTICS = 'ACCESS_ADVANCED_ANALYTICS',
  USE_CUSTOM_BRANDING = 'USE_CUSTOM_BRANDING',
  CREATE_GROUP = 'CREATE_GROUP',
}

@Injectable()
export class CapabilityService {
  private readonly logger = new Logger(CapabilityService.name);

  constructor(
    @Inject(forwardRef(() => MembershipService))
    private readonly membershipService: MembershipService,
    @Inject(forwardRef(() => ListingsService))
    private readonly listingsService: ListingsService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    @Inject(forwardRef(() => ServicesService))
    private readonly servicesService: ServicesService,
    @Inject(forwardRef(() => ActivityTimerService))
    private readonly activityTimerService: ActivityTimerService,
    @Inject(forwardRef(() => GiftCardService))
    private readonly giftCardService: GiftCardService,
    @Inject(forwardRef(() => CouponProductService))
    private readonly couponProductService: CouponProductService,
    @Inject(forwardRef(() => PromotionService))
    private readonly promotionService: PromotionService,
    @Inject(forwardRef(() => TierService))
    private readonly tierService: TierService,
  ) {}

  async getEffectiveConfig(userId: string): Promise<TierConfig | null> {
    // 1. Try Membership (Paid/Assigned)
    const membership = await this.membershipService.findActiveWithTier(userId);
    if (membership && membership.tier && membership.isActive) {
        if (!membership.expiresAt || new Date() <= membership.expiresAt) {
            return membership.tier.configuration;
        }
    }

    // 2. Fallback to Default/Free Tier
    const defaultTier = await this.tierService.findDefaultTier();
    if (defaultTier) {
        return defaultTier.configuration;
    }

    return null;
  }

  async checkPermission(
    userId: string,
    action: ActionType,
    context?: any,
  ): Promise<void> {
    const config = await this.getEffectiveConfig(userId);

    if (!config) {
      throw new ForbiddenException('Active membership or trial is required to perform this action.');
    }

    switch (action) {
      case ActionType.CREATE_LISTING:
        await this.checkListingLimit(userId, config);
        break;
      case ActionType.CAN_SELL_PRODUCTS:
        if (!config.quotas.allowProductListing) {
          throw new ForbiddenException('Your current tier/trial does not allow product listings.');
        }
        break;
      case ActionType.CAN_SELL_SERVICES:
        if (!config.quotas.allowServiceListing) {
          throw new ForbiddenException('Your current tier/trial does not allow service listings.');
        }
        break;
      case ActionType.CREATE_PRODUCT:
        if (!config.quotas.allowProductListing) {
          throw new ForbiddenException('Your current tier/trial does not allow product listings.');
        }
        await this.checkProductLimit(userId, config);
        break;
      case ActionType.CREATE_SERVICE:
        if (!config.quotas.allowServiceListing) {
          throw new ForbiddenException('Your current tier/trial does not allow service listings.');
        }
        await this.checkServiceLimit(userId, config);
        break;
      case ActionType.CREATE_GIFT_CARD_TEMPLATE:
        const gcCount = context?.currentCount ?? await this.giftCardService.countTemplatesForOwner(userId);
        this.checkQuota(gcCount, config.quotas.maxGiftCardTemplates, 'gift card templates');
        break;
      case ActionType.CREATE_COUPON_TEMPLATE:
        const couponCount = context?.currentCount ?? await this.couponProductService.countForUser(userId);
        this.checkQuota(couponCount, config.quotas.maxCouponTemplates, 'coupon templates');
        break;
      case ActionType.CREATE_LOYALTY_PROGRAM:
        const loyaltyCount = context?.currentCount ?? await this.promotionService.countForUser(userId);
        this.checkQuota(loyaltyCount, config.quotas.maxLoyaltyPrograms, 'loyalty programs');
        break;
      case ActionType.ACCESS_ADVANCED_ANALYTICS:
        if (!config.featureFlags.advancedAnalytics) {
          throw new ForbiddenException('Your current tier/trial does not allow access to advanced analytics.');
        }
        break;
      case ActionType.USE_CUSTOM_BRANDING:
        if (!config.featureFlags.allowCustomBranding) {
          throw new ForbiddenException('Your current tier/trial does not allow custom branding.');
        }
        break;
      case ActionType.CREATE_GROUP:
        if (!config.featureFlags.allowGroupCreation) {
            throw new ForbiddenException('Your current tier/trial does not allow creating groups.');
        }
        break;
      default:
        break;
    }
  }

  async getUsageSummary(userId: string) {
    const config = await this.getEffectiveConfig(userId);
    if (!config) {
        return {
            hasAccess: false,
            message: 'No active membership or trial found.'
        };
    }

    const [
        listingCount,
        productCount,
        serviceCount,
        giftCardTemplateCount,
        couponTemplateCount,
        loyaltyProgramCount
    ] = await Promise.all([
        this.listingsService.findAllForUser(userId, 1, 1).then(res => res.meta.total),
        this.productService.countForUser(userId),
        this.servicesService.countForUser(userId),
        this.giftCardService.countTemplatesForOwner(userId),
        this.couponProductService.countForUser(userId),
        this.promotionService.countForUser(userId)
    ]);

    return {
        hasAccess: true,
        quotas: {
            listings: {
                used: listingCount,
                limit: config.quotas.maxListings,
                remaining: config.quotas.maxListings === -1 ? -1 : Math.max(0, config.quotas.maxListings - listingCount)
            },
            products: {
                used: productCount,
                limit: config.quotas.maxProducts,
                remaining: config.quotas.maxProducts === -1 ? -1 : Math.max(0, config.quotas.maxProducts - productCount),
                allowed: config.quotas.allowProductListing
            },
            services: {
                used: serviceCount,
                limit: config.quotas.maxServices,
                remaining: config.quotas.maxServices === -1 ? -1 : Math.max(0, config.quotas.maxServices - serviceCount),
                allowed: config.quotas.allowServiceListing
            },
            giftCardTemplates: {
                used: giftCardTemplateCount,
                limit: config.quotas.maxGiftCardTemplates,
                remaining: config.quotas.maxGiftCardTemplates === -1 ? -1 : Math.max(0, config.quotas.maxGiftCardTemplates - giftCardTemplateCount)
            },
            couponTemplates: {
                used: couponTemplateCount,
                limit: config.quotas.maxCouponTemplates,
                remaining: config.quotas.maxCouponTemplates === -1 ? -1 : Math.max(0, config.quotas.maxCouponTemplates - couponTemplateCount)
            },
            loyaltyPrograms: {
                used: loyaltyProgramCount,
                limit: config.quotas.maxLoyaltyPrograms,
                remaining: config.quotas.maxLoyaltyPrograms === -1 ? -1 : Math.max(0, config.quotas.maxLoyaltyPrograms - loyaltyProgramCount)
            },
            imagesPerListing: {
                limit: config.quotas.maxImagesPerListing
            },
            featuredListings: {
                limit: config.quotas.featuredListingAllowance
            }
        },
        features: config.featureFlags
    };
  }

  private async checkListingLimit(userId: string, config: TierConfig) {
    const limit = config.quotas.maxListings;
    if (limit === -1) return;

    const { meta } = await this.listingsService.findAllForUser(userId, 1, 1);
    const currentCount = meta.total;

    if (currentCount >= limit) {
       throw new ForbiddenException(`You have reached your limit of ${limit} listings.`);
    }
  }

  private async checkProductLimit(userId: string, config: TierConfig) {
    const limit = config.quotas.maxProducts;
    if (limit === -1) return;

    const currentCount = await this.productService.countForUser(userId);

    if (currentCount >= limit) {
       throw new ForbiddenException(`You have reached your limit of ${limit} products.`);
    }
  }

  private async checkServiceLimit(userId: string, config: TierConfig) {
    const limit = config.quotas.maxServices;
    if (limit === -1) return;

    const currentCount = await this.servicesService.countForUser(userId);

    if (currentCount >= limit) {
       throw new ForbiddenException(`You have reached your limit of ${limit} services.`);
    }
  }

  private checkQuota(current: number, limit: number, resourceName: string) {
    if (limit === -1) return;
    if (current >= limit) {
      throw new ForbiddenException(`You have reached your limit of ${limit} ${resourceName}.`);
    }
  }
}
