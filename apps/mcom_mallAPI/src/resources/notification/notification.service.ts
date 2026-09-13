import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { NotificationType } from './notification.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create(
      createNotificationDto,
    );
    return this.notificationRepository.save(notification);
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { recipientId: userId, seen: false },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
    });
  }

  async markAsSeen(notificationIds: string[]) {
    return this.notificationRepository.update(notificationIds, { seen: true });
  }

  async broadcast(senderId: string, dto: BroadcastNotificationDto) {
    const recipients = dto.recipientIds ?? [];
    const notificationType = dto.type ?? NotificationType.BROADCAST_ALERT;
    const entityId = dto.entityId ?? senderId;

    if (recipients.length === 0) {
      const notification = this.notificationRepository.create({
        senderId,
        recipientId: senderId,
        type: notificationType,
        entityId,
        seen: false,
      });
      await this.notificationRepository.save(notification);
      return {
        success: true,
        count: 1,
        message: 'Broadcast notification recorded successfully',
      };
    }

    const notifications = recipients.map((recipientId) =>
      this.notificationRepository.create({
        senderId,
        recipientId,
        type: notificationType,
        entityId,
        seen: false,
      }),
    );
    await this.notificationRepository.save(notifications);
    return {
      success: true,
      count: notifications.length,
      message: `Broadcast notification sent to ${notifications.length} recipients`,
    };
  }
}
