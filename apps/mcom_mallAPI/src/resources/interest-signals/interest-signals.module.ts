import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterestSignal } from './entities/interest-signal.entity';
import { InterestSignalsService } from './interest-signals.service';
import { InterestSignalsController } from './interest-signals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InterestSignal])],
  controllers: [InterestSignalsController],
  providers: [InterestSignalsService],
  exports: [InterestSignalsService],
})
export class InterestSignalsModule {}
