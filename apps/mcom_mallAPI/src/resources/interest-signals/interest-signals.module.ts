import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterestSignal } from './entities/interest-signal.entity';
import { BusinessClaim } from './entities/business-claim.entity';
import { InterestSignalsService } from './interest-signals.service';
import { ClaimsService } from './claims.service';
import { InterestSignalsController } from './interest-signals.controller';
import { ClaimsController } from './claims.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InterestSignal, BusinessClaim])],
  controllers: [InterestSignalsController, ClaimsController],
  providers: [InterestSignalsService, ClaimsService],
  exports: [InterestSignalsService, ClaimsService],
})
export class InterestSignalsModule {}
