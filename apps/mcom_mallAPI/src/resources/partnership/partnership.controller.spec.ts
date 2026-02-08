import { Test, TestingModule } from '@nestjs/testing';
import { PartnershipController } from './partnership.controller';
import { PartnershipService } from './partnership.service';
import { Service } from '../services/entities/service.entity';
import { NotFoundException } from '@nestjs/common';

const mockPartnershipService = {
  getProductPartnerships: jest.fn(),
};

describe('PartnershipController', () => {
  let controller: PartnershipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnershipController],
      providers: [
        {
          provide: PartnershipService,
          useValue: mockPartnershipService,
        },
      ],
    }).compile();

    controller = module.get<PartnershipController>(PartnershipController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProductPartnerships', () => {
    it('should return a list of services for a given product', async () => {
      const productId = 'product1';
      const mockServices = [new Service(), new Service()];
      mockPartnershipService.getProductPartnerships.mockResolvedValue(mockServices);

      const result = await controller.getProductPartnerships(productId);

      expect(mockPartnershipService.getProductPartnerships).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockServices);
    });

    it('should throw NotFoundException if product is not found', async () => {
      const productId = 'non-existent-product';
      mockPartnershipService.getProductPartnerships.mockRejectedValue(new NotFoundException('Product not found'));

      await expect(controller.getProductPartnerships(productId)).rejects.toThrow(NotFoundException);
      expect(mockPartnershipService.getProductPartnerships).toHaveBeenCalledWith(productId);
    });
  });
});