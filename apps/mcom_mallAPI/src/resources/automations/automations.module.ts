import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Automation } from './entities/automation.entity';
import { PromotionParticipant } from '../promotion/entities/promotion-participant.entity';
import { Promotion } from '../promotion/entities/promotion.entity';
import { Business } from '../listings/entities/listing.entity';
import { AutomationsService } from './automations.service';
import { AutomationsController } from './automations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Automation,
      PromotionParticipant,
      Promotion,
      Business,
    ]),
  ],
  controllers: [AutomationsController],
  providers: [AutomationsService],
  exports: [AutomationsService],
})
export class AutomationsModule {}
