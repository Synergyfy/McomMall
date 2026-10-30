import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../product/entities/product.entity';
import { Business } from '../listings/entities/listing.entity';
import { Service } from '../services/entities/service.entity';
import { GiftCard } from '../gift-card/entities/gift-card.entity';
import { GiftCardTemplate } from '../gift-card/entities/gift-card-template.entity';
import { Voucher } from '../voucher/entities/voucher.entity';
import { VoucherProduct } from '../voucher/entities/voucher-product.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { SavedCoupon } from '../coupon/entities/saved-coupon.entity';
import { ProductModule } from '../product/product.module';
import { GiftCardModule } from '../gift-card/gift-card.module';
import { VoucherModule } from '../voucher/voucher.module';
import { CouponModule } from '../coupon/coupon.module';
import { RewardIssuanceMirror } from './entities/reward-issuance-mirror.entity';
import { RewardsClientService } from './rewards-client.service';
import { RewardsEligibilityService } from './rewards-eligibility.service';
import { RewardsIntegrationService } from './rewards-integration.service';
import { PartnerCatalogService } from './partner-catalog.service';
import { PartnerTemplatesService } from './partner-templates.service';
import { RewardsIntegrationController } from './rewards-integration.controller';
import { PartnerCatalogController } from './partner-catalog.controller';
import { PartnerTemplatesController } from './partner-templates.controller';
import { PartnerEventsController } from './partner-events.controller';
import { PartnerInstrumentsController } from './partner-instruments.controller';
import { PublicRewardsController } from './public-rewards.controller';
import { PartnerInstrumentsModule } from '../partner-instruments/partner-instruments.module';

/**
 * MCOM Rewards ↔ MCOM Mall integration: outbound reward reads/reservations
 * over the service mesh, reward eligibility for the cart, the shopper rewards
 * wallet, and the partner catalogue/event surface exposed to rewards.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Product,
      Business,
      Service,
      GiftCard,
      GiftCardTemplate,
      Voucher,
      VoucherProduct,
      Coupon,
      SavedCoupon,
      RewardIssuanceMirror,
    ]),
    forwardRef(() => ProductModule),
    PartnerInstrumentsModule,
    // Partner instrument issuance reuses the gift-card / voucher / coupon
    // services. forwardRef breaks the existing Wallet→Order→Rewards cycle.
    forwardRef(() => GiftCardModule),
    forwardRef(() => VoucherModule),
    forwardRef(() => CouponModule),
  ],
  controllers: [
    RewardsIntegrationController,
    PartnerCatalogController,
    PartnerTemplatesController,
    PartnerEventsController,
    PartnerInstrumentsController,
    PublicRewardsController,
  ],
  providers: [
    RewardsClientService,
    RewardsEligibilityService,
    RewardsIntegrationService,
    PartnerCatalogService,
    PartnerTemplatesService,
  ],
  exports: [
    RewardsClientService,
    RewardsEligibilityService,
    RewardsIntegrationService,
  ],
})
export class RewardsIntegrationModule {}
