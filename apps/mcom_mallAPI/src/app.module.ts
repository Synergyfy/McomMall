import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './resources/users/users.module';
import dataSource from './database/data-source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { ConfigModule } from '@nestjs/config';
import commissionConfig from './config/commission.config';
import { AuthModule } from './resources/auth/auth.module';
import { ListingsModule } from './resources/listings/listings.module';
import { ClaimModule } from './resources/claim/claim.module';
import { ProductModule } from './resources/product/product.module';
import { CampaignModule } from './resources/campaign/campaign.module';
import { PaymentsModule } from './resources/payments/payments.module';
import { CouponModule } from './resources/coupon/coupon.module';
import { OrderModule } from './resources/order/order.module';
import { CartModule } from './resources/cart/cart.module';
import { MessagingModule } from './resources/messaging/messaging.module';
import { WishlistModule } from './resources/wishlist/wishlist.module';
import { BookingModule } from './resources/booking/booking.module';
import { PromotionModule } from './resources/promotion/promotion.module';
import { ServicesModule } from './resources/services/services.module';
import { OfferModule } from './resources/offer/offer.module';
import { NotificationModule } from './resources/notification/notification.module';
import { ReviewsModule } from './resources/reviews/reviews.module';
import { CheckoutModule } from './resources/checkout/checkout.module';
import { ActivitiesModule } from './resources/activities/activities.module';
import { WalletModule } from './resources/wallet/wallet.module';
import { StatsModule } from './resources/stats/stats.module';
import { GiftCardModule } from './resources/gift-card/gift-card.module';
import { AdminModule } from './resources/admin/admin.module';
import { VoucherModule } from './resources/voucher/voucher.module';
import { ExchangeModule } from './resources/exchange/exchange.module';
import { PartnershipModule } from './resources/partnership/partnership.module';
import { ServiceProviderProfileModule } from './resources/service-provider-profile/service-provider-profile.module';
import { MembershipModule } from './resources/membership/membership.module';
import { GroupCirclesModule } from './resources/group-circles/group-circles.module';
import { SearchModule } from './resources/search/search.module';
import { DisputeModule } from './resources/dispute/dispute.module';
import { TierModule } from './resources/tier/tier.module';
import { TaxonomyModule } from './resources/taxonomy/taxonomy.module';
import { MoneyEngineModule } from './resources/money-engine/money-engine.module';
import { MarketplaceModule } from './resources/marketplace/marketplace.module';
import { ProvisionModule } from './resources/provision/provision.module';
import { ShippingAddressModule } from './resources/shipping-address/shipping-address.module';
import { HelpRequestsModule } from './help-requests/help-requests.module';
import { TerminalCashbackModule } from './resources/terminal-cashback/terminal-cashback.module';
import { CampaignCashbackModule } from './resources/campaign-cashback/campaign-cashback.module';
import { ActivityTimerModule } from './resources/activity-timer/activity-timer.module';
import { ActivityTimerGuard } from './resources/activity-timer/activity-timer.guard';
import { SupportTicketsModule } from './resources/support-tickets/support-tickets.module';
import { SeasonsModule } from './resources/seasons/seasons.module';
import { DigitalValueModule } from './resources/digital-value/digital-value.module';
import { ShippingModule } from './resources/shipping/shipping.module';
import { LocalMallModule } from './resources/localmall/localmall.module';
import { GoogleBusinessModule } from './resources/google-business/google-business.module';
import { EventsModule } from './resources/events/events.module';
import { RotatorsModule } from './resources/rotators/rotators.module';
import { GamificationModule } from './resources/gamification/gamification.module';
import { QrCodesModule } from './resources/qr-codes/qr-codes.module';
import { InterestSignalsModule } from './resources/interest-signals/interest-signals.module';
import { AutomationsModule } from './resources/automations/automations.module';
import { VisibilityModule } from './resources/visibility/visibility.module';

@Module({
  imports: [
    QrCodesModule,
    InterestSignalsModule,
    AutomationsModule,
    VisibilityModule,
    EventsModule,
    RotatorsModule,
    GamificationModule,
    GoogleBusinessModule,
    LocalMallModule,
    DigitalValueModule,
    SupportTicketsModule,
    ActivityTimerModule,
    MarketplaceModule,
    MoneyEngineModule,
    TaxonomyModule,
    TierModule,
    DisputeModule,
    SearchModule,
    GroupCirclesModule,
    MembershipModule,
    ServiceProviderProfileModule,
    PartnershipModule,
    AdminModule,
    ProvisionModule,
    ShippingAddressModule,
    ShippingModule,
    HelpRequestsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [commissionConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        ...dataSource.options,
        autoLoadEntities: true,
      }),
      dataSourceFactory: async () => dataSource,
    }),

    UsersModule,
    AuthModule,
    ListingsModule,
    ClaimModule,
    ProductModule,
    CampaignModule,
    PaymentsModule,
    CouponModule,
    OrderModule,
    CartModule,
    MessagingModule,
    WishlistModule,
    BookingModule,
    ServicesModule,
    PromotionModule,
    OfferModule,
    NotificationModule,
    ReviewsModule,
    CheckoutModule,
    ActivitiesModule,
    WalletModule,
    StatsModule,
    GiftCardModule,
    VoucherModule,
    ExchangeModule,
    TerminalCashbackModule,
    CampaignCashbackModule,
    SeasonsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ActivityTimerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
