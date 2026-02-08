import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationType } from './notification.enum';

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: Repository<Notification>;

  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    repository = module.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const createNotificationDto: CreateNotificationDto = {
        recipientId: 'recipient-id',
        type: NotificationType.NEW_ORDER,
        entityId: 'entity-id',
      };
      const notification = new Notification();
      mockNotificationRepository.create.mockReturnValue(notification);
      mockNotificationRepository.save.mockResolvedValue(notification);

      expect(await service.create(createNotificationDto)).toBe(notification);
      expect(repository.create).toHaveBeenCalledWith(createNotificationDto);
      expect(repository.save).toHaveBeenCalledWith(notification);
    });
  });

  describe('getNotifications', () => {
    it('should return a list of unseen notifications for a user', async () => {
      const userId = 'user-id';
      const notifications = [new Notification(), new Notification()];
      mockNotificationRepository.find.mockResolvedValue(notifications);

      const result = await service.getNotifications(userId);

      expect(result).toBe(notifications);
      expect(repository.find).toHaveBeenCalledWith({
        where: { recipientId: userId, seen: false },
        relations: ['sender'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('markAsSeen', () => {
    it('should mark notifications as seen', async () => {
      const notificationIds = ['notification-id-1', 'notification-id-2'];
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);

      await service.markAsSeen(notificationIds);

      expect(repository.update).toHaveBeenCalledWith(notificationIds, {
        seen: true,
      });
    });
  });
});
