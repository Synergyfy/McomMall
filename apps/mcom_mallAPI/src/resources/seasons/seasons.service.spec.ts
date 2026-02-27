import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SeasonsService } from './seasons.service';
import { Season } from './entities/season.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('SeasonsService', () => {
  let service: SeasonsService;

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest
      .fn()
      .mockImplementation((season) =>
        Promise.resolve({ id: 'uuid', ...season }),
      ),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeasonsService,
        {
          provide: getRepositoryToken(Season),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SeasonsService>(SeasonsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a season successfully', async () => {
      const dto = {
        name: 'Summer 2026',
        startDate: '2026-06-01T00:00:00Z',
        endDate: '2026-08-31T23:59:59Z',
      };
      const result = await service.create(dto);
      expect(result.name).toBe(dto.name);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if startDate >= endDate', async () => {
      const dto = {
        name: 'Invalid Season',
        startDate: '2026-09-01T00:00:00Z',
        endDate: '2026-08-31T23:59:59Z',
      };
      try {
        await service.create(dto);
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Start date must be before end date');
      }
    });
  });

  describe('findOne', () => {
    it('should return a season', async () => {
      const season = { id: 'uuid', name: 'Summer' };
      mockRepository.findOne.mockResolvedValue(season);
      const result = await service.findOne('uuid');
      expect(result).toEqual(season);
    });

    it('should throw NotFoundException if season not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a season successfully', async () => {
      const season = {
        id: 'uuid',
        name: 'Summer',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-08-31'),
      };
      mockRepository.findOne.mockResolvedValue(season);
      const dto = { name: 'Updated Summer' };
      const result = await service.update('uuid', dto);
      expect(result.name).toBe(dto.name);
    });

    it('should throw BadRequestException if updated dates are invalid', async () => {
      const season = {
        id: 'uuid',
        name: 'Summer',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-08-31'),
      };
      mockRepository.findOne.mockResolvedValue(season);
      const dto = { endDate: '2026-05-01T00:00:00Z' };
      await expect(service.update('uuid', dto)).rejects.toThrow(
        'Start date must be before end date',
      );
    });
  });
});
