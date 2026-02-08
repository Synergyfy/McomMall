import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { HashModule } from 'src/common/hash/hash.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { AdminActivitiesController } from './controllers/activities.admin.controller';
import { AdminListingsController } from './controllers/listings.admin.controller';
import { AdminProductsController } from './controllers/products.admin.controller';
import { AdminServicesController } from './controllers/services.admin.controller';
import { AdminOrdersController } from './controllers/orders.admin.controller';
import { AdminBookingsController } from './controllers/bookings.admin.controller';
import { AdminPromotionsController } from './controllers/promotions.admin.controller';
import { AdminTransactionsController } from './controllers/transactions.admin.controller';
import { AdminAnalyticsController } from './controllers/analytics.admin.controller';
import { AdminActivitiesService } from './services/activities.admin.service';
import { AdminListingsService } from './services/listings.admin.service';
import { AdminProductsService } from './services/products.admin.service';
import { AdminServicesService } from './services/services.admin.service';
import { AdminOrdersService } from './services/orders.admin.service';
import { AdminBookingsService } from './services/bookings.admin.service';
import { AdminPromotionsService } from './services/promotions.admin.service';
import { AdminTransactionsService } from './services/transactions.admin.service';
import { AdminAnalyticsService } from './services/analytics.admin.service';
import { Activity } from '../activities/entities/activity.entity';
import { Business } from '../listings/entities/listing.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { Order } from '../order/entities/order.entity';
import { RentalBooking } from '../booking/entities/rental-booking.entity';
import { ServiceBooking } from '../booking/entities/service-booking.entity';
import { Promotion } from '../promotion/entities/promotion.entity';
import { MembershipPayment } from '../membership/entities/membership-payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Activity,
      Business,
      Product,
      Service,
      Order,
      RentalBooking,
      ServiceBooking,
      Promotion,
      MembershipPayment,
    ]),
    HashModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [
    AdminController,
    AdminActivitiesController,
    AdminListingsController,
    AdminProductsController,
    AdminServicesController,
    AdminOrdersController,
    AdminBookingsController,
    AdminPromotionsController,
    AdminTransactionsController,
    AdminAnalyticsController,
  ],
  providers: [
    AdminService,
    AdminActivitiesService,
    AdminListingsService,
    AdminProductsService,
    AdminServicesService,
    AdminOrdersService,
    AdminBookingsService,
    AdminPromotionsService,
    AdminTransactionsService,
    AdminAnalyticsService,
  ],
})
export class AdminModule {}