import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from './customer.service';
import {
  CustomerController,
  CustomerPublicController,
} from './customer.controller';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { Review } from '../reviews/entities/review.entity';
import { Event } from '../events/entities/event.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Promotion } from '../promotion/entities/promotion.entity';
import { Campaign } from '../campaign/entities/campaign.entity';
import { InterestSignal } from '../interest-signals/entities/interest-signal.entity';
import { PointTransaction } from '../transaction/entities/point-transaction.entity';
import { Reward } from './entities/reward.entity';
import { RewardRedemption } from './entities/reward-redemption.entity';
import { DailySpinLedger } from './entities/daily-spin-ledger.entity';
import { ScratchCardLedger } from './entities/scratch-card-ledger.entity';
import { Challenge } from './entities/challenge.entity';
import { ChallengeProgress } from './entities/challenge-progress.entity';
import { EventRsvp } from './entities/event-rsvp.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Business,
      Review,
      Event,
      Offer,
      Promotion,
      Campaign,
      InterestSignal,
      PointTransaction,
      Reward,
      RewardRedemption,
      DailySpinLedger,
      ScratchCardLedger,
      Challenge,
      ChallengeProgress,
      EventRsvp,
    ]),
  ],
  controllers: [CustomerController, CustomerPublicController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
