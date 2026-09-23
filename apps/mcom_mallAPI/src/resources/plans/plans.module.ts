import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { PlanTierLevel } from './entities/plan-tier-level.entity';
import { PlanVariant } from './entities/plan-variant.entity';
import { PlanPrice } from './entities/plan-price.entity';
import { Feature } from './entities/feature.entity';
import { PlanVariantFeature } from './entities/plan-variant-feature.entity';
import { PlansService } from './services/plans.service';
import { PlanExpiryService } from './services/plan-expiry.service';
import { PlansController } from './controllers/plans.controller';
import { SystemPlanController } from './controllers/system-plan.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Plan,
      PlanTierLevel,
      PlanVariant,
      PlanPrice,
      Feature,
      PlanVariantFeature,
    ]),
  ],
  controllers: [PlansController, SystemPlanController],
  providers: [PlansService, PlanExpiryService],
  exports: [PlansService, PlanExpiryService],
})
export class PlansModule {}
