import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: NotificationService;

  const mockNotificationService = {
    getNotifications: jest.fn(),
    markAsSeen: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNotifications', () => {
    it('should call notificationService.getNotifications with the user id', async () => {
      const req = { user: { id: 'user-id' } };
      await controller.getNotifications(req as any);
      expect(service.getNotifications).toHaveBeenCalledWith('user-id');
    });
  });

  describe('markAsSeen', () => {
    it('should call notificationService.markAsSeen with the notification ids', async () => {
      const notificationIds = ['notification-id-1', 'notification-id-2'];
      await controller.markAsSeen(notificationIds);
      expect(service.markAsSeen).toHaveBeenCalledWith(notificationIds);
    });
  });
});
