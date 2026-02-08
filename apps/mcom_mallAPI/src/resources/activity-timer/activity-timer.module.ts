import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityTimerController } from './activity-timer.controller';
import { ActivityTimerService } from './activity-timer.service';
import { ActivityTimerTemplate } from './entities/activity-timer-template.entity';
import { ActivityTimer } from './entities/activity-timer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityTimerTemplate, ActivityTimer])],
  controllers: [ActivityTimerController],
  providers: [ActivityTimerService],
  exports: [ActivityTimerService],
})
export class ActivityTimerModule {}
