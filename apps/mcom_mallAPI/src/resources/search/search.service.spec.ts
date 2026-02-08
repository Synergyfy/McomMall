import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { In, Repository } from 'typeorm';

describe('SearchService', () => {
  let service: SearchService;
  let productRepository: Repository<Product>;
  let serviceRepository: Repository<Service>;

  const mockEntityManager = {
    query: jest.fn(),
  };

  const mockProductRepository = {
    manager: mockEntityManager,
    findBy: jest.fn(),
  };

  const mockServiceRepository = {
    findBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Service),
          useValue: mockServiceRepository,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    serviceRepository = module.get<Repository<Service>>(
      getRepositoryToken(Service),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should return an empty paginated result for an empty query', async () => {
      const result = await service.search('', { page: 1, limit: 10 });
      expect(result.items).toEqual([]);
      expect(result.meta.totalItems).toBe(0);
    });

    it('should execute paginated search and return results', async () => {
      const query = 'test';
      const options = { page: 1, limit: 10 };

      mockEntityManager.query
        .mockResolvedValueOnce([{ count: '2' }]) // Mock count query
        .mockResolvedValueOnce([
          { id: 'p1', type: 'product', created_at: new Date() },
          { id: 's1', type: 'service', created_at: new Date() },
        ]); // Mock main query

      const mockProducts = [{ id: 'p1' }];
      const mockServices = [{ id: 's1' }];
      mockProductRepository.findBy.mockResolvedValue(mockProducts);
      mockServiceRepository.findBy.mockResolvedValue(mockServices);

      const result = await service.search(query, options);

      expect(mockEntityManager.query).toHaveBeenCalledTimes(2);
      expect(productRepository.findBy).toHaveBeenCalledWith({
        id: In(['p1']),
      });
      expect(serviceRepository.findBy).toHaveBeenCalledWith({
        id: In(['s1']),
      });

      expect(result.meta.totalItems).toBe(2);
      expect(result.items.length).toBe(2);
    });
  });
});
