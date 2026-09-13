import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotspotCampaign } from './entities/hotspot-campaign.entity';
import { Hotspot } from './entities/hotspot.entity';
import { HotspotService } from './hotspot.service';
import { HotspotController } from './hotspot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HotspotCampaign, Hotspot])],
  controllers: [HotspotController],
  providers: [HotspotService],
  exports: [HotspotService],
})
export class HotspotModule {}
