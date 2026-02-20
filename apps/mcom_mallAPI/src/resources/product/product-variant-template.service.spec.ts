import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariantTemplateService } from './product-variant-template.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductVariantTemplate } from './entities/product-variant-template.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProductVariantTemplateService', () => {
  let service: ProductVariantTemplateService;
  let repository: any;

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest
      .fn()
      .mockImplementation((template) =>
        Promise.resolve({ id: 'uuid', ...template }),
      ),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariantTemplateService,
        {
          provide: getRepositoryToken(ProductVariantTemplate),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductVariantTemplateService>(
      ProductVariantTemplateService,
    );
    repository = module.get(getRepositoryToken(ProductVariantTemplate));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new template', async () => {
      const dto = {
        name: 'Test Template',
        productType: 'physical',
        attributes: [
          { name: 'Color', options: [{ name: 'Red', priceModifier: 0 }] },
        ],
      };
      const result = await service.create(dto as any);
      expect(result).toHaveProperty('id', 'uuid');
      expect(result.name).toBe('Test Template');
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated templates based on search criteria', async () => {
      const searchDto = {
        page: 1,
        limit: 10,
        productType: 'physical',
        category: 'Electronics',
        search: 'Template',
      };

      const mockTemplates = [{ id: '1', name: 'Template 1' }];
      const totalItems = 1;

      const queryBuilder = repository.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([
        mockTemplates,
        totalItems,
      ]);

      const result = await service.findAllPaginated(searchDto as any);

      expect(result.data).toEqual(mockTemplates);
      expect(result.meta.totalItems).toBe(totalItems);
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'template.productType = :productType',
        { productType: 'physical' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'template.category = :category',
        { category: 'Electronics' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'template.name ILIKE :search',
        { search: '%Template%' },
      );
    });
  });

  describe('findOne', () => {
    it('should return a template if found', async () => {
      const mockTemplate = { id: '1', name: 'Test' };
      mockRepository.findOne.mockResolvedValue(mockTemplate);

      const result = await service.findOne('1');
      expect(result).toEqual(mockTemplate);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });
});
