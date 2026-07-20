import { Test, TestingModule } from '@nestjs/testing';
import { SystemPlanController } from './system-plan.controller';
import { TierService } from './tier.service';

describe('SystemPlanController', () => {
  let controller: SystemPlanController;

  const mockTierService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemPlanController],
      providers: [
        {
          provide: TierService,
          useValue: mockTierService,
        },
      ],
    }).compile();

    controller = module.get<SystemPlanController>(SystemPlanController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call tierService.create with the DTO', async () => {
      const dto: any = { name: 'Gold Plan', monthlyPrice: 29.99 };
      mockTierService.create.mockResolvedValue({ id: 'plan-id', ...dto });

      const result = await controller.create(dto);

      expect(mockTierService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'plan-id', ...dto });
    });
  });

  describe('findAll', () => {
    it('should return all plans from tierService', async () => {
      const plans = [{ id: '1', name: 'Gold' }, { id: '2', name: 'Silver' }];
      mockTierService.findAll.mockResolvedValue(plans);

      const result = await controller.findAll();

      expect(mockTierService.findAll).toHaveBeenCalled();
      expect(result).toEqual(plans);
    });
  });

  describe('findOne', () => {
    it('should return a plan by id', async () => {
      const plan = { id: 'plan-id', name: 'Gold' };
      mockTierService.findOne.mockResolvedValue(plan);

      const result = await controller.findOne('plan-id');

      expect(mockTierService.findOne).toHaveBeenCalledWith('plan-id');
      expect(result).toEqual(plan);
    });
  });

  describe('update', () => {
    it('should call tierService.update with id and DTO', async () => {
      const dto: any = { name: 'Updated Plan' };
      mockTierService.update.mockResolvedValue({ id: 'plan-id', ...dto });

      const result = await controller.update('plan-id', dto);

      expect(mockTierService.update).toHaveBeenCalledWith('plan-id', dto);
      expect(result).toEqual({ id: 'plan-id', ...dto });
    });
  });

  describe('remove', () => {
    it('should call tierService.remove with id', async () => {
      mockTierService.remove.mockResolvedValue(undefined);

      await controller.remove('plan-id');

      expect(mockTierService.remove).toHaveBeenCalledWith('plan-id');
    });
  });
});
