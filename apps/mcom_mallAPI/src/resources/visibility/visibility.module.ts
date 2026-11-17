import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisibilitySettings } from './entities/visibility-settings.entity';
import { BoroughCampaign } from './entities/borough-campaign.entity';
import { VisibilityService } from './visibility.service';
import { HighStreetService } from './high-street.service';
import { BoroughCampaignsService } from './borough-campaigns.service';
import { VisibilityController } from './visibility.controller';
import { BoroughCampaignsController } from './borough-campaigns.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([VisibilitySettings, BoroughCampaign]),
  ],
  controllers: [VisibilityController, BoroughCampaignsController],
  providers: [VisibilityService, HighStreetService, BoroughCampaignsService],
  exports: [VisibilityService, HighStreetService, BoroughCampaignsService],
})
export class VisibilityModule {}
