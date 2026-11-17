import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from '../listings/entities/listing.entity';
import { Event } from '../events/entities/event.entity';
import { Offer } from '../offer/entities/offer.entity';
import { DiscoverController } from './discover.controller';
import { DiscoverService } from './discover.service';
import { ListingsModule } from '../listings/listings.module';
import { EventsModule } from '../events/events.module';
import { OfferModule } from '../offer/offer.module';
import { VisibilityModule } from '../visibility/visibility.module';
import { MembershipModule } from '../membership/membership.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, Event, Offer]),
    ListingsModule,
    EventsModule,
    OfferModule,
    VisibilityModule,
    MembershipModule,
    WalletModule,
  ],
  controllers: [DiscoverController],
  providers: [DiscoverService],
  exports: [DiscoverService],
})
export class DiscoverModule {}
