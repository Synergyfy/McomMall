import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PlansService } from './plans.service';
import { Plan } from '../entities/plan.entity';
import { PlanVariant } from '../entities/plan-variant.entity';

function mockQueryBuilder(result: unknown) {
  return {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(result),
  };
}

describe('PlansService.resolveActivePrice', () => {
  const variantRepository = { createQueryBuilder: jest.fn() };
  const service = new PlansService(
    {} as Repository<Plan>,
    variantRepository as unknown as Repository<PlanVariant>,

    {} as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the variant with its active price', async () => {
    const variant = {
      id: 'variant-1',
      prices: [
        { id: 'price-old', amount: '19.99', isActive: false },
        { id: 'price-new', amount: '29.99', isActive: true },
      ],
    };
    variantRepository.createQueryBuilder.mockReturnValue(
      mockQueryBuilder(variant),
    );

    const result = await service.resolveActivePrice('variant-1');

    expect(result.variant.id).toBe('variant-1');
    expect(result.price.id).toBe('price-new');
  });

  it('throws NotFoundException for an unknown variant', async () => {
    variantRepository.createQueryBuilder.mockReturnValue(
      mockQueryBuilder(null),
    );

    await expect(service.resolveActivePrice('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws BadRequestException when no active price exists', async () => {
    const variant = {
      id: 'variant-1',
      prices: [{ id: 'price-old', amount: '19.99', isActive: false }],
    };
    variantRepository.createQueryBuilder.mockReturnValue(
      mockQueryBuilder(variant),
    );

    await expect(
      service.resolveActivePrice('variant-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
