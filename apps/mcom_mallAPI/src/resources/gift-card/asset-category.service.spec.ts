import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetCategoryService } from './asset-category.service';
import { AssetCategory } from './entities/asset-category.entity';
import { CreateAssetCategoryDto } from './dto/create-asset-category.dto';
import { UpdateAssetCategoryDto } from './dto/update-asset-category.dto';
import { User } from '../users/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

const mockAssetCategoryRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
});

describe('AssetCategoryService', () => {
  let service: AssetCategoryService;
  let repository: Repository<AssetCategory>;

  const mockUser = new User();
  mockUser.id = 'user-uuid-1';

  const mockUser2 = new User();
  mockUser2.id = 'user-uuid-2';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetCategoryService,
        {
          provide: getRepositoryToken(AssetCategory),
          useFactory: mockAssetCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<AssetCategoryService>(AssetCategoryService);
    repository = module.get<Repository<AssetCategory>>(
      getRepositoryToken(AssetCategory),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new category with the correct owner', async () => {
      const createDto: CreateAssetCategoryDto = { name: 'Test Category' };
      const category = new AssetCategory();
      category.name = createDto.name;
      category.owner = mockUser;

      jest.spyOn(repository, 'create').mockReturnValue(category);
      jest.spyOn(repository, 'save').mockResolvedValue(category);

      const result = await service.create(createDto, mockUser);

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        owner: mockUser,
      });
      expect(repository.save).toHaveBeenCalledWith(category);
      expect(result).toEqual(category);
      expect(result.owner).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of categories for the specified user', async () => {
      const categories = [new AssetCategory(), new AssetCategory()];
      jest.spyOn(repository, 'find').mockResolvedValue(categories);
      const result = await service.findAll(mockUser);
      expect(repository.find).toHaveBeenCalledWith({
        where: { ownerId: mockUser.id },
      });
      expect(result).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('should return a category if found and owned by the user', async () => {
      const category = new AssetCategory();
      jest.spyOn(repository, 'findOne').mockResolvedValue(category);
      const result = await service.findOne('some-id', mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'some-id', ownerId: mockUser.id },
      });
      expect(result).toEqual(category);
    });

    it('should throw NotFoundException if category not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);
      await expect(service.findOne('some-id', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if category is not owned by the user', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);
      await expect(service.findOne('some-id', mockUser2)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'some-id', ownerId: mockUser2.id },
      });
    });
  });

  describe('update', () => {
    it('should update and return a category if owned by the user', async () => {
      const updateDto: UpdateAssetCategoryDto = { name: 'Updated' };
      const category = new AssetCategory();
      jest.spyOn(service, 'findOne').mockResolvedValue(category);
      jest.spyOn(repository, 'merge').mockImplementation();
      jest.spyOn(repository, 'save').mockResolvedValue(category);

      const result = await service.update('some-id', updateDto, mockUser);

      expect(service.findOne).toHaveBeenCalledWith('some-id', mockUser);
      expect(repository.merge).toHaveBeenCalledWith(category, updateDto);
      expect(repository.save).toHaveBeenCalledWith(category);
      expect(result).toEqual(category);
    });

    it('should throw an error if trying to update a category not owned by the user', async () => {
      const updateDto: UpdateAssetCategoryDto = { name: 'Updated' };
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(
        service.update('some-id', updateDto, mockUser2),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a category if owned by the user', async () => {
      const category = new AssetCategory();
      jest.spyOn(service, 'findOne').mockResolvedValue(category);
      jest.spyOn(repository, 'remove').mockResolvedValue(undefined);

      await service.remove('some-id', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('some-id', mockUser);
      expect(repository.remove).toHaveBeenCalledWith(category);
    });

    it('should throw an error if trying to remove a category not owned by the user', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(service.remove('some-id', mockUser2)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});