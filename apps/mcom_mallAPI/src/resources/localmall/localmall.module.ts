import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivatedRegion } from './entities/activated-region.entity';
import { LocalMall } from './entities/localmall.entity';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { PointTransaction } from '../transaction/entities/point-transaction.entity';
import { OnboardingDeciderService } from './onboarding-decider.service';
import { LocalMallController } from './localmall.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivatedRegion,
      LocalMall,
      Business,
      User,
      PointTransaction,
    ]),
  ],
  controllers: [LocalMallController],
  providers: [OnboardingDeciderService],
  exports: [OnboardingDeciderService],
})
export class LocalMallModule {}
