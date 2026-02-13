import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityTimerController } from './activity-timer.controller';
import { ActivityTimerService } from './activity-timer.service';
import { ActivityTimer } from './entities/activity-timer.entity';
@Module({
  imports: [TypeOrmModule.forFeature([ActivityTimer])],
  controllers: [ActivityTimerController],
  providers: [ActivityTimerService],
  exports: [ActivityTimerService],
})
export class ActivityTimerModule { }
