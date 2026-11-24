import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionalCampaign } from './entities/promotional-campaign.entity';
import { PromotionalCampaignItem } from './entities/promotional-campaign-item.entity';
import { PromotionalCampaignBusiness } from './entities/promotional-campaign-business.entity';
import { Business } from '../listings/entities/listing.entity';
import { PromotionalCampaignsService } from './promotional-campaigns.service';
import { PromotionalCampaignsController } from './promotional-campaigns.controller';
import { PromotionalCampaignsAdminController } from './promotional-campaigns.admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PromotionalCampaign,
      PromotionalCampaignItem,
      PromotionalCampaignBusiness,
      Business,
    ]),
  ],
  controllers: [
    PromotionalCampaignsController,
    PromotionalCampaignsAdminController,
  ],
  providers: [PromotionalCampaignsService],
  exports: [PromotionalCampaignsService],
})
export class PromotionalCampaignModule {}
