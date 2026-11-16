import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { BroadcastSegmentDto } from './dto/broadcast-segment.dto';
import { NotificationType } from './notification.enum';
import { User } from '../users/entities/user.entity';
import { CustomerSegment } from '../customer-directory/entities/customer-segment.entity';
import { UserRole } from '../../common/role.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CustomerSegment)
    private readonly segmentRepository: Repository<CustomerSegment>,
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
    const entityId = dto.entityId;

    const targetIds = Array.isArray(dto.recipientIds)
      ? recipients
      : await this.resolveRecipients(senderId, undefined, undefined);

    if (targetIds.length === 0) {
      return {
        success: true,
        count: 0,
        message: 'No matching recipients were found',
      };
    }

    const notifications = targetIds.map((recipientId) =>
      this.notificationRepository.create({
        senderId,
        recipientId,
        type: notificationType,
        entityId,
        title: dto.title,
        message: dto.message,
        channel: dto.channel ?? 'in_app',
        seen: false,
      }),
    );
    await this.notificationRepository.save(notifications);
    return {
      success: true,
      count: notifications.length,
      message: `Broadcast sent to ${notifications.length} recipients`,
    };
  }

  /**
   * Resolves a real recipient list from the users table. When a segment is
   * provided its type is used to narrow the audience; otherwise every active
   * customer is targeted.
   */
  private async resolveRecipients(
    senderId: string,
    businessId?: string,
    segmentId?: string,
  ): Promise<string[]> {
    let segment: CustomerSegment | null = null;
    if (segmentId) {
      segment = await this.segmentRepository.findOne({
        where: { id: segmentId },
      });
      if (!segment) {
        throw new NotFoundException('Customer segment not found');
      }
    }

    const qb = this.userRepository
      .createQueryBuilder('user')
      .select('user.id', 'id')
      .where('user.role = :role', { role: UserRole.CUSTOMER })
      .andWhere('user.isActive = true')
      .andWhere('user.id != :senderId', { senderId });

    if (segment) {
      switch (segment.type) {
        case 'vip':
          qb.andWhere('user.points >= :min', { min: 2000 });
          break;
        case 'high_spenders':
          qb.andWhere('user.points >= :min', { min: 1000 });
          break;
        case 'frequent':
          qb.andWhere('user.points >= :min', { min: 500 });
          break;
        case 'inactive':
          qb.andWhere(
            '(user.lastLogin IS NULL OR user.lastLogin < :cutoff)',
            { cutoff: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
          );
          break;
        default:
          break;
      }
    }

    if (businessId) {
      qb.andWhere(
        `(user.id IN (SELECT pt."userId" FROM point_transactions pt WHERE pt.business_id = :businessId)
          OR user.id IN (
            SELECT booking."userId" FROM service_bookings booking
            INNER JOIN services service ON service.id = booking."serviceId"
            WHERE service."businessId" = :businessId AND booking."userId" IS NOT NULL
          ))`,
        { businessId },
      );
    }

    const rows = await qb.limit(5000).getRawMany();
    return rows.map((row) => row.id);
  }

  async broadcastToSegment(senderId: string, dto: BroadcastSegmentDto) {
    const recipientIds = await this.resolveRecipients(
      senderId,
      dto.businessId,
      dto.segmentId,
    );

    return this.broadcast(senderId, {
      title: dto.title,
      message: dto.message,
      recipientIds,
      type: dto.type ?? NotificationType.BROADCAST_ALERT,
      entityId: dto.entityId,
      channel: dto.channel,
    });
  }

  async countRecipients(
    senderId: string,
    businessId?: string,
    segmentId?: string,
  ): Promise<number> {
    const ids = await this.resolveRecipients(senderId, businessId, segmentId);
    return ids.length;
  }
}
