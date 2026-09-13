import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { ServiceBooking } from '../booking/entities/service-booking.entity';
import { Review } from '../reviews/entities/review.entity';
import { PromotionParticipant } from '../promotion/entities/promotion-participant.entity';
import { InterestSignal } from '../interest-signals/entities/interest-signal.entity';
import { Business } from '../listings/entities/listing.entity';
import { CustomerSegment } from './entities/customer-segment.entity';
import { CustomerDirectoryService } from './customer-directory.service';
import { CustomerDirectoryController } from './customer-directory.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ServiceBooking,
      Review,
      PromotionParticipant,
      InterestSignal,
      Business,
      CustomerSegment,
    ]),
  ],
  controllers: [CustomerDirectoryController],
  providers: [CustomerDirectoryService],
  exports: [CustomerDirectoryService],
})
export class CustomerDirectoryModule {}
