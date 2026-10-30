import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from '../listings/entities/listing.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { GiftCard } from '../gift-card/entities/gift-card.entity';
import { Voucher } from '../voucher/entities/voucher.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { RedemptionLog } from '../coupon/entities/redemption-log.entity';
import { InstrumentScope } from './entities/instrument-scope.entity';
import { PartnerRedemptionOutbox } from './entities/partner-redemption-outbox.entity';
import { InstrumentScopeService } from './instrument-scope.service';
import { PartnerCallbackService } from './partner-callback.service';
import { PartnerFeatureFlagsService } from './partner-feature-flags.service';
import { PartnerInstrumentStatusService } from './partner-instrument-status.service';
import { PartnerRateLimitGuard } from './guards/partner-rate-limit.guard';

/**
 * Shared partner-instrument domain: scope persistence/enforcement, lifecycle
 * callbacks (outbox), feature flags, and status/revoke. This module has no
 * dependency on the gift-card/voucher/coupon feature modules so they can
 * safely import it without creating a cycle.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstrumentScope,
      PartnerRedemptionOutbox,
      Business,
      Product,
      Service,
      GiftCard,
      Voucher,
      Coupon,
      RedemptionLog,
    ]),
  ],
  providers: [
    InstrumentScopeService,
    PartnerCallbackService,
    PartnerFeatureFlagsService,
    PartnerInstrumentStatusService,
    PartnerRateLimitGuard,
  ],
  exports: [
    InstrumentScopeService,
    PartnerCallbackService,
    PartnerFeatureFlagsService,
    PartnerInstrumentStatusService,
    PartnerRateLimitGuard,
  ],
})
export class PartnerInstrumentsModule {}
