import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borough } from './entities/borough.entity';
import { BoroughCampaign } from '../visibility/entities/borough-campaign.entity';
import { BoroughsService } from './boroughs.service';
import { BoroughsController } from './boroughs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Borough, BoroughCampaign])],
  controllers: [BoroughsController],
  providers: [BoroughsService],
  exports: [BoroughsService],
})
export class BoroughsModule {}
