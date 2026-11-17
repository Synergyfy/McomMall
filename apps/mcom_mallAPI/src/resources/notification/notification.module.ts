import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { User } from '../users/entities/user.entity';
import { CustomerSegment } from '../customer-directory/entities/customer-segment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User, CustomerSegment])],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
