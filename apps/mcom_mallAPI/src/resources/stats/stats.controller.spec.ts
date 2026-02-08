import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { User } from '../users/entities/user.entity';
import { SalesChartQueryDto } from './dto/sales-chart.dto';
import { UserRole } from '../../common/role.enum';

describe('StatsController', () => {
  let controller: StatsController;
  let service: StatsService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    role: UserRole.OWNER,
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        {
          provide: StatsService,
          useValue: {
            getUserStats: jest.fn(),
            getSalesChart: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StatsController>(StatsController);
    service = module.get<StatsService>(StatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserStats', () => {
    it('should call the service with the current user', () => {
      controller.getUserStats(mockUser);
      expect(service.getUserStats).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getSalesChart', () => {
    it('should call the service with the current user and query', () => {
      const query: SalesChartQueryDto = {
        startDate: new Date(),
        endDate: new Date(),
        allTime: false,
      };
      controller.getSalesChart(mockUser, query);
      expect(service.getSalesChart).toHaveBeenCalledWith(mockUser, query);
    });
  });
});
