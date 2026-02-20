import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityTimerController } from './activity-timer.controller';
import { ActivityTimerService } from './activity-timer.service';
import { ActivityTimer } from './entities/activity-timer.entity';
import { UserActivity } from './entities/user-activity.entity';
@Module({
  imports: [TypeOrmModule.forFeature([ActivityTimer, UserActivity])],
  controllers: [ActivityTimerController],
  providers: [ActivityTimerService],
  exports: [ActivityTimerService],
})
export class ActivityTimerModule { }
