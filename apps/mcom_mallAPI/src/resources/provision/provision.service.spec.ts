import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProvisionService } from './provision.service';
import { Provision, ProvisionType } from './entities/provision.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProvisionService (Mall)', () => {
  let service: ProvisionService;
  let repository: Repository<Provision>;

  const mockProvisionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvisionService,
        {
          provide: getRepositoryToken(Provision),
          useValue: mockProvisionRepository,
        },
      ],
    }).compile();

    service = module.get<ProvisionService>(ProvisionService);
    repository = module.get<Repository<Provision>>(
      getRepositoryToken(Provision),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save a new provision', async () => {
      const dto = {
        code: 'MALL-CODE',
        type: ProvisionType.TRIAL_EXTENSION,
        payload: { durationDays: 30 },
        expiresAt: '2026-12-31',
      };

      mockProvisionRepository.findOne.mockResolvedValue(null);
      mockProvisionRepository.create.mockReturnValue(dto);
      mockProvisionRepository.save.mockResolvedValue(dto);

      const result = await service.create(dto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { code: dto.code },
      });
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ code: dto.code }),
      );
      expect(result).toEqual(dto);
    });
  });

  describe('validateAndMarkRedeemed', () => {
    it('should mark provision as redeemed if valid', async () => {
      const code = 'VALID-MALL';
      const userId = 'user-123';
      const provision = {
        code,
        isRedeemed: false,
        expiresAt: new Date(Date.now() + 100000),
        save: jest.fn(),
      };

      mockProvisionRepository.findOne.mockResolvedValue(provision);
      mockProvisionRepository.save.mockImplementation((val) => val);

      const result = await service.validateAndMarkRedeemed(code, userId);

      expect(result.isRedeemed).toBe(true);
      expect(result.redeemedByUserId).toBe(userId);
    });
  });
});
