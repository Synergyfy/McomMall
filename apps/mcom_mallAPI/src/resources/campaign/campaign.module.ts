import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from './entities/campaign.entity';
import { Business } from '../listings/entities/listing.entity';
import { MarketingCampaign } from './entities/marketing-campaign.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, Business, MarketingCampaign])],
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [TypeOrmModule],
})
export class CampaignModule {}
