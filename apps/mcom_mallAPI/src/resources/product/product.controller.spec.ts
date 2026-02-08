import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ListingsService } from '../listings/listing.service';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductService;

  const mockProductService = {
    findAllForBusiness: jest.fn(),
  };

  const mockListingsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
        {
          provide: ListingsService,
          useValue: mockListingsService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllForBusiness', () => {
    it('should call productService.findAllForBusiness with correct arguments', async () => {
      const businessId = 'some-business-id';
      const user = new User();
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const result = { data: [], total: 0, page: 1, limit: 10 };

      mockProductService.findAllForBusiness.mockResolvedValue(result);

      await controller.findAllForBusiness(businessId, user, paginationDto);

      expect(productService.findAllForBusiness).toHaveBeenCalledWith(
        businessId,
        paginationDto,
        user,
      );
    });
  });
});
