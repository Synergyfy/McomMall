import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceBanner } from './entities/marketplace-banner.entity';
import { MarketplaceCategory } from './entities/marketplace-category.entity';
import { MarketplaceSection } from './entities/marketplace-section.entity';
import { VoucherProduct } from '../voucher/entities/voucher-product.entity';
import { GiftCardTemplate } from '../gift-card/entities/gift-card-template.entity';
import { CouponProduct } from '../coupon/entities/coupon-product.entity';
import { Service } from '../services/entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarketplaceBanner,
      MarketplaceCategory,
      MarketplaceSection,
      VoucherProduct,
      GiftCardTemplate,
      CouponProduct,
      Service,
    ]),
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
