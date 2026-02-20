import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftCardConsumerController } from './gift-card-consumer.controller';
import { GiftCardMerchantController } from './gift-card-merchant.controller';
import { GiftCardAdminController } from './gift-card-admin.controller';
import { SystemGiftCardController } from './system-gift-card.controller';
import { GiftCardAssetController } from './gift-card-asset.controller';
import { AssetCategoryController } from './asset-category.controller';
import { GiftCard } from './entities/gift-card.entity';
import { GiftCardTemplate } from './entities/gift-card-template.entity';
import { GiftCardTransaction } from './entities/gift-card-transaction.entity';
import { GiftCardSettings } from './entities/gift-card-settings.entity';
import { Business } from '../listings/entities/listing.entity';
import { Order } from '../order/entities/order.entity';
import { OrderPayment } from '../order/entities/order-payment.entity';
import { GiftCardAsset } from './entities/gift-card-asset.entity';
import { AssetCategory } from './entities/asset-category.entity';
import { WalletModule } from '../wallet/wallet.module';
import { PaymentsModule } from '../payments/payments.module';
import { GiftCardService } from './gift-card.service';
import { GiftCardAssetService } from './gift-card-asset.service';
import { AssetCategoryService } from './asset-category.service';
import { User } from '../users/entities/user.entity';
import { CapabilityModule } from '../capability/capability.module';
import { DigitalValueModule } from '../digital-value/digital-value.module';

@Module({
  imports: [
    DigitalValueModule,
    forwardRef(() => CapabilityModule),
    TypeOrmModule.forFeature([
      GiftCard,
      GiftCardTemplate,
      GiftCardTransaction,
      GiftCardSettings,
      Business,
      Order,
      OrderPayment,
      GiftCardAsset,
      AssetCategory,
      User,
    ]),
    forwardRef(() => WalletModule),
    PaymentsModule,
  ],
  controllers: [
    GiftCardConsumerController,
    GiftCardMerchantController,
    GiftCardAdminController,
    SystemGiftCardController,
    GiftCardAssetController,
    AssetCategoryController,
  ],
  providers: [GiftCardService, GiftCardAssetService, AssetCategoryService],
  exports: [GiftCardService, GiftCardAssetService, AssetCategoryService],
})
export class GiftCardModule { }
