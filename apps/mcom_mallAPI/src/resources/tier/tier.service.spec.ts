import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TierService } from './tier.service';
import { Tier } from './entities/tier.entity';
import { SeasonsService } from '../seasons/seasons.service';
import { TierType } from './enums/tier-type.enum';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('TierService', () => {
  let service: TierService;
  let tierRepository: any;
  let seasonsService: any;

  const mockTierRepository = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(tier => Promise.resolve({ id: 'tier-uuid', ...tier })),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockSeasonsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TierService,
        {
          provide: getRepositoryToken(Tier),
          useValue: mockTierRepository,
        },
        {
          provide: SeasonsService,
          useValue: mockSeasonsService,
        },
      ],
    }).compile();

    service = module.get<TierService>(TierService);
    tierRepository = module.get(getRepositoryToken(Tier));
    seasonsService = module.get(SeasonsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a standard tier', async () => {
      const dto: any = { name: 'Gold', monthlyPrice: 20, type: TierType.STANDARD, configuration: {} };
      const result = await service.create(dto);
      expect(result.name).toBe('Gold');
      expect(mockTierRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for seasonal tier without seasonId', async () => {
      const dto: any = { name: 'Seasonal', type: TierType.SEASONAL, configuration: {} };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create a seasonal tier with valid seasonId', async () => {
      const dto: any = { name: 'Seasonal', type: TierType.SEASONAL, seasonId: 'season-uuid', configuration: {} };
      mockSeasonsService.findOne.mockResolvedValue({ id: 'season-uuid' });
      const result = await service.create(dto);
      expect(result.seasonId).toBe('season-uuid');
      expect(mockSeasonsService.findOne).toHaveBeenCalledWith('season-uuid');
    });
  });

  describe('update', () => {
    it('should validate seasonId when updating to seasonal type', async () => {
      const tier = { id: 'tier-uuid', type: TierType.STANDARD };
      mockTierRepository.findOne.mockResolvedValue(tier);
      const dto: any = { type: TierType.SEASONAL };
      await expect(service.update('tier-uuid', dto)).rejects.toThrow(BadRequestException);
    });

    it('should update seasonal tier with valid seasonId', async () => {
      const tier = { id: 'tier-uuid', type: TierType.STANDARD };
      mockTierRepository.findOne.mockResolvedValue(tier);
      const dto: any = { type: TierType.SEASONAL, seasonId: 'season-uuid' };
      mockSeasonsService.findOne.mockResolvedValue({ id: 'season-uuid' });
      const result = await service.update('tier-uuid', dto);
      expect(result.type).toBe(TierType.SEASONAL);
      expect(result.seasonId).toBe('season-uuid');
    });
  });
});
