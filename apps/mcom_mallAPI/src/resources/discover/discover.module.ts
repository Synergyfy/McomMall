import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from '../listings/entities/listing.entity';
import { Event } from '../events/entities/event.entity';
import { Promotion } from '../promotion/entities/promotion.entity';
import { DiscoverController } from './discover.controller';
import { DiscoverService } from './discover.service';
import { ListingsModule } from '../listings/listings.module';
import { EventsModule } from '../events/events.module';
import { PromotionModule } from '../promotion/promotion.module';
import { VisibilityModule } from '../visibility/visibility.module';
import { MembershipModule } from '../membership/membership.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, Event, Promotion]),
    ListingsModule,
    EventsModule,
    PromotionModule,
    VisibilityModule,
    MembershipModule,
    WalletModule,
  ],
  controllers: [DiscoverController],
  providers: [DiscoverService],
  exports: [DiscoverService],
})
export class DiscoverModule {}
