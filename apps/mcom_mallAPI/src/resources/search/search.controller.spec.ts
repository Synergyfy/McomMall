import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('SearchController', () => {
  let controller: SearchController;
  let service: SearchService;

  const mockProductRepository = {};
  const mockServiceRepository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
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

    controller = module.get<SearchController>(SearchController);
    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should call searchService.search with the correct query and pagination', async () => {
      const query = 'test';
      const page = 1;
      const limit = 10;
      const searchSpy = jest.spyOn(service, 'search').mockResolvedValueOnce({
        items: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: limit,
          totalPages: 0,
          currentPage: page,
        },
      });
      await controller.search(query, page, limit);
      expect(searchSpy).toHaveBeenCalledWith(query, { page, limit });
    });
  });
});
