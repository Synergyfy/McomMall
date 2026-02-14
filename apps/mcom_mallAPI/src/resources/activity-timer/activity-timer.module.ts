import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityTimerController } from './activity-timer.controller';
import { ActivityTimerService } from './activity-timer.service';
import { ActivityTimer } from './entities/activity-timer.entity';
import { ActivityTimerDefinition } from './entities/activity-timer-definition.entity';
@Module({
  imports: [TypeOrmModule.forFeature([ActivityTimer, ActivityTimerDefinition])],
  controllers: [ActivityTimerController],
  providers: [ActivityTimerService],
  exports: [ActivityTimerService],
})
export class ActivityTimerModule { }
