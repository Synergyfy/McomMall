import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

const mockServicesService = {
  create: jest.fn(),
  findAllForBusiness: jest.fn(),
  findAllForUser: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  addBundledService: jest.fn(),
  removeBundledService: jest.fn(),
  addConfigurableAddon: jest.fn(),
  removeConfigurableAddon: jest.fn(),
};

describe('ServicesController', () => {
  let controller: ServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', () => {
      const dto = {} as CreateServiceDto;
      const req = { user: { id: 'test-user-id' } };
      controller.create(dto, req);
      expect(mockServicesService.create).toHaveBeenCalledWith(
        dto,
        'test-user-id',
      );
    });
  });

  describe('update', () => {
    it('should call service.update', () => {
      const dto = {};
      const req = { user: { id: 'test-user-id' } };
      const id = 'test-service-id';
      controller.update(id, dto, req);
      expect(mockServicesService.update).toHaveBeenCalledWith(
        id,
        dto,
        'test-user-id',
      );
    });
  });

  describe('remove', () => {
    it('should call service.remove', () => {
      const req = { user: { id: 'test-user-id' } };
      const id = 'test-service-id';
      controller.remove(id, req);
      expect(mockServicesService.remove).toHaveBeenCalledWith(
        id,
        'test-user-id',
      );
    });
  });

  describe('findAllForBusiness', () => {
    it('should call service.findAllForBusiness with correct arguments', async () => {
      const businessId = 'some-business-id';
      const paginationDto = { page: 1, limit: 10 };
      const result = { data: [], total: 0, page: 1, limit: 10 };

      mockServicesService.findAllForBusiness.mockResolvedValue(result);

      await controller.findAllForBusiness(businessId, paginationDto);

      expect(mockServicesService.findAllForBusiness).toHaveBeenCalledWith(
        businessId,
        paginationDto,
      );
    });
  });
});
