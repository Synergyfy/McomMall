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
    private readonly membershipService: MembershipService,
    @Inject(forwardRef(() => ListingsService))
    private readonly listingsService: ListingsService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    @Inject(forwardRef(() => ServicesService))
    private readonly servicesService: ServicesService,
  ) {}

  async checkPermission(
    userId: string,
    action: ActionType,
    context?: any,
  ): Promise<void> {
    const membership = await this.membershipService.findActiveWithTier(userId);

    if (!membership || !membership.tier || !membership.isActive) {
      throw new ForbiddenException('Active membership with a valid tier is required.');
    }

    if (membership.expiresAt && new Date() > membership.expiresAt) {
        throw new ForbiddenException('Your membership has expired.');
    }

    const config = membership.tier.configuration;
    if (!config) {
        this.logger.error(`Tier configuration missing for tier ${membership.tier.id}`);
        throw new ForbiddenException('Tier configuration error. Please contact support.');
    }

    switch (action) {
      case ActionType.CREATE_LISTING:
        await this.checkListingLimit(userId, config);
        break;
      case ActionType.CAN_SELL_PRODUCTS:
        if (!config.quotas.allowProductListing) {
          throw new ForbiddenException('Your tier does not allow product listings.');
        }
        break;
      case ActionType.CAN_SELL_SERVICES:
        if (!config.quotas.allowServiceListing) {
          throw new ForbiddenException('Your tier does not allow service listings.');
        }
        break;
      case ActionType.CREATE_PRODUCT:
        if (!config.quotas.allowProductListing) {
          throw new ForbiddenException('Your tier does not allow product listings.');
        }
        await this.checkProductLimit(userId, config);
        break;
      case ActionType.CREATE_SERVICE:
        if (!config.quotas.allowServiceListing) {
          throw new ForbiddenException('Your tier does not allow service listings.');
        }
        await this.checkServiceLimit(userId, config);
        break;
      case ActionType.CREATE_GIFT_CARD_TEMPLATE:
        this.checkQuota(context?.currentCount, config.quotas.maxGiftCardTemplates, 'gift card templates');
        break;
      case ActionType.CREATE_COUPON_TEMPLATE:
        this.checkQuota(context?.currentCount, config.quotas.maxCouponTemplates, 'coupon templates');
        break;
      case ActionType.CREATE_LOYALTY_PROGRAM:
        this.checkQuota(context?.currentCount, config.quotas.maxLoyaltyPrograms, 'loyalty programs');
        break;
      case ActionType.ACCESS_ADVANCED_ANALYTICS:
        if (!config.featureFlags.advancedAnalytics) {
          throw new ForbiddenException('Your tier does not allow access to advanced analytics.');
        }
        break;
      case ActionType.USE_CUSTOM_BRANDING:
        if (!config.featureFlags.allowCustomBranding) {
          throw new ForbiddenException('Your tier does not allow custom branding.');
        }
        break;
      case ActionType.CREATE_GROUP:
        if (!config.featureFlags.allowGroupCreation) {
            throw new ForbiddenException('Your tier does not allow creating groups.');
        }
        break;
      default:
        break;
    }
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
