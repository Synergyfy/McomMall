import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivatedRegion } from './entities/activated-region.entity';
import { LocalMall } from './entities/localmall.entity';
import { Business } from '../listings/entities/listing.entity';
import { OnboardingDeciderService } from './onboarding-decider.service';
import { LocalMallController } from './localmall.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivatedRegion, LocalMall, Business]),
  ],
  controllers: [LocalMallController],
  providers: [OnboardingDeciderService],
  exports: [OnboardingDeciderService],
})
export class LocalMallModule {}
