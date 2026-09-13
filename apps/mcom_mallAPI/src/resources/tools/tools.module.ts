import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from '../listings/entities/listing.entity';
import { Product } from '../product/entities/product.entity';
import { ServiceBooking } from '../booking/entities/service-booking.entity';
import { Service } from '../services/entities/service.entity';
import { Notification } from '../notification/entities/notification.entity';
import { Campaign } from '../campaign/entities/campaign.entity';
import { Rotator } from '../rotators/entities/rotator.entity';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Business,
      Product,
      ServiceBooking,
      Service,
      Notification,
      Campaign,
      Rotator,
    ]),
  ],
  controllers: [ToolsController],
  providers: [ToolsService],
  exports: [ToolsService],
})
export class ToolsModule {}
