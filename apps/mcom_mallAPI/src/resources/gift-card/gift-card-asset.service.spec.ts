import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { GiftCardAssetService } from './gift-card-asset.service';
import { GiftCardAsset } from './entities/gift-card-asset.entity';
import { AssetCategory } from './entities/asset-category.entity';
import { User } from '../users/entities/user.entity';
import { CreateGiftCardAssetDto } from './dto/create-gift-card-asset.dto';
import { UpdateGiftCardAssetDto } from './dto/update-gift-card-asset.dto';
import { NotFoundException } from '@nestjs/common';

const mockUser = { id: 'user-1' } as User;

describe('GiftCardAssetService', () => {
  let service: GiftCardAssetService;
  let assetRepository: Repository<GiftCardAsset>;
  let categoryRepository: Repository<AssetCategory>;

  const mockAssetRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockCategoryRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GiftCardAssetService,
        {
          provide: getRepositoryToken(GiftCardAsset),
          useValue: mockAssetRepository,
        },
        {
          provide: getRepositoryToken(AssetCategory),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<GiftCardAssetService>(GiftCardAssetService);
    assetRepository = module.get<Repository<GiftCardAsset>>(
      getRepositoryToken(GiftCardAsset),
    );
    categoryRepository = module.get<Repository<AssetCategory>>(
      getRepositoryToken(AssetCategory),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an asset with new categories', async () => {
      const createDto: CreateGiftCardAssetDto = {
        name: 'Test Asset',
        url: 'http://example.com/asset.gif',
        assetCategoryIds: ['new-id', 'festive-id'],
      };
      const expectedCategories = [
        { id: 'new-id', name: 'new' },
        { id: 'festive-id', name: 'festive' },
      ];

      mockCategoryRepository.find.mockResolvedValue(expectedCategories);
      mockAssetRepository.create.mockImplementation((asset) => asset);
      mockAssetRepository.save.mockResolvedValue({
        ...createDto,
        id: 'asset-1',
        owner: mockUser,
        categories: expectedCategories,
      });

      const result = await service.create(createDto, mockUser);

      expect(mockCategoryRepository.find).toHaveBeenCalledWith({
        where: { id: In(createDto.assetCategoryIds), ownerId: mockUser.id },
      });
      expect(mockAssetRepository.create).toHaveBeenCalledWith({
        name: 'Test Asset',
        url: 'http://example.com/asset.gif',
        owner: mockUser,
        categories: expectedCategories,
      });
      expect(mockAssetRepository.save).toHaveBeenCalled();
      expect(result.categories.map((c) => c.name)).toEqual(['new', 'festive']);
    });

    it('should create an asset with existing categories', async () => {
      const createDto: CreateGiftCardAssetDto = {
        name: 'Test Asset',
        url: 'http://example.com/asset.gif',
        assetCategoryIds: ['birthday-id', 'funny-id'],
      };
      const existingCategories = [
        { id: 'birthday-id', name: 'birthday' },
        { id: 'funny-id', name: 'funny' },
      ];

      mockCategoryRepository.find.mockResolvedValue(existingCategories);
      mockAssetRepository.create.mockImplementation((asset) => asset);
      mockAssetRepository.save.mockResolvedValue({
        ...createDto,
        id: 'asset-2',
        owner: mockUser,
        categories: existingCategories,
      });

      const result = await service.create(createDto, mockUser);

      expect(mockCategoryRepository.find).toHaveBeenCalledWith({
        where: { id: In(createDto.assetCategoryIds), ownerId: mockUser.id },
      });
      expect(mockAssetRepository.save).toHaveBeenCalled();
      expect(result.categories).toEqual(existingCategories);
    });
  });

  describe('update', () => {
    it('should update an asset and its categories', async () => {
      const assetId = 'asset-1';
      const updateDto: UpdateGiftCardAssetDto = {
        name: 'Updated Asset Name',
        assetCategoryIds: ['celebration-id'],
      };
      const existingAsset = {
        id: assetId,
        name: 'Old Name',
        url: 'http://example.com/asset.gif',
        ownerId: mockUser.id,
        categories: [],
      };
      const celebrationCategory = { id: 'celebration-id', name: 'celebration' };

      mockAssetRepository.findOne.mockResolvedValue(existingAsset);
      mockCategoryRepository.find.mockResolvedValue([celebrationCategory]);
      mockAssetRepository.save.mockImplementation(async (asset) => asset);

      const result = await service.update(assetId, updateDto, mockUser);

      expect(mockAssetRepository.findOne).toHaveBeenCalledWith({
        where: { id: assetId, ownerId: mockUser.id },
        relations: ['categories'],
      });
      expect(mockCategoryRepository.find).toHaveBeenCalledWith({
        where: { id: In(updateDto.assetCategoryIds), ownerId: mockUser.id },
      });
      expect(result.name).toBe('Updated Asset Name');
      expect(result.categories[0].name).toBe('celebration');
      expect(mockAssetRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Asset Name',
          categories: [expect.objectContaining({ name: 'celebration' })],
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if asset not found', async () => {
      mockAssetRepository.findOne.mockResolvedValue(null);
      await expect(
        service.findOne('non-existent-id', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
