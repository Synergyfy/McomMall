import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityMission } from './entities/quality-mission.entity';
import { Business } from '../listings/entities/listing.entity';
import { QualityService } from './quality.service';
import { QualityController } from './quality.controller';

@Module({
  imports: [TypeOrmModule.forFeature([QualityMission, Business])],
  controllers: [QualityController],
  providers: [QualityService],
  exports: [QualityService],
})
export class QualityModule {}
