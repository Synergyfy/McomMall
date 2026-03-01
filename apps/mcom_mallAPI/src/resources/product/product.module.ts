import { Module, forwardRef } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ListingsModule } from '../listings/listings.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariantTemplate } from './entities/product-variant-template.entity';
import { ActivitiesModule } from '../activities/activities.module';
import { User } from '../users/entities/user.entity';
import { Partnership } from '../partnership/entities/partnership.entity';
import { PartnershipRequest } from '../partnership/entities/partnership-request.entity';
import { PromotionModule } from '../promotion/promotion.module';
import { CapabilityModule } from '../capability/capability.module';
import { ProductVariantTemplateService } from './product-variant-template.service';
import { ProductVariantTemplateController } from './product-variant-template.controller';
import { ActivityTimerModule } from '../activity-timer/activity-timer.module';

@Module({
  imports: [
    forwardRef(() => CapabilityModule),
    forwardRef(() => ListingsModule),
    TypeOrmModule.forFeature([
      Product,
      ProductVariantTemplate,
      User,
      Partnership,
      PartnershipRequest,
    ]),
    ActivitiesModule,
    ActivityTimerModule,
    forwardRef(() => PromotionModule),
  ],
  controllers: [ProductController, ProductVariantTemplateController],
  providers: [ProductService, ProductVariantTemplateService],
  exports: [ProductService, ProductVariantTemplateService],
})
export class ProductModule {}
