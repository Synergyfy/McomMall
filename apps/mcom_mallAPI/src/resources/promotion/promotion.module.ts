import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from './entities/promotion.entity';
import { Product } from '../product/entities/product.entity';
import { Business } from '../listings/entities/listing.entity';
import { PromotionController } from './promotion.controller';
import { PromotionService } from './promotion.service';
import { PromotionParticipant } from './entities/promotion-participant.entity';
import { User } from '../users/entities/user.entity';
import { PromotionEngineService } from './promotion-engine.service';
import { PromotionActivity } from './entities/promotion-activity.entity';
import { ActivitiesModule } from '../activities/activities.module';
import { TransactionModule } from '../transaction/transaction.module';
import { CapabilityModule } from '../capability/capability.module';
import { ActivityTimerModule } from '../activity-timer/activity-timer.module';

@Module({
  imports: [
    forwardRef(() => CapabilityModule),
    TypeOrmModule.forFeature([
      Promotion,
      Product,
      Business,
      PromotionParticipant,
      User,
      PromotionActivity,
    ]),
    ActivitiesModule,
    ActivityTimerModule,
    TransactionModule,
  ],
  controllers: [PromotionController],
  providers: [PromotionService, PromotionEngineService],
  exports: [PromotionService, PromotionEngineService],
})
export class PromotionModule {}
