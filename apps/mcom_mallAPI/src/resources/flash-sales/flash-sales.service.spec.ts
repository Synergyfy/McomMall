import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlashSalesService } from './flash-sales.service';
import { FlashSaleItem } from './entities/flash-sale-item.entity';
import { FlashSaleStatus } from './flash-sale.enum';
import { NotFoundException } from '@nestjs/common';

describe('FlashSalesService', () => {
  let service: FlashSalesService;
  let repo: Repository<FlashSaleItem>;

  const mockItem: FlashSaleItem = {
    id: 'item-1',
    title: 'Do Pass Yourself',
    category: 'Appliances',
    price: 120,
    discountedPrice: 99.99,
    itemsLeft: 15,
    endDate: new Date(Date.now() + 3600 * 1000),
    status: FlashSaleStatus.ACTIVE,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  } as FlashSaleItem;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        FlashSalesService,
        {
          provide: getRepositoryToken(FlashSaleItem),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(
              (data: Partial<FlashSaleItem>) => data as FlashSaleItem,
            ),
            save: jest.fn((data: FlashSaleItem) => Promise.resolve(data)),
            merge: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<FlashSalesService>(FlashSalesService);
    repo = moduleRef.get<Repository<FlashSaleItem>>(
      getRepositoryToken(FlashSaleItem),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllActive', () => {
    it('returns only active, unexpired items', async () => {
      const active = { ...mockItem };
      const expired: FlashSaleItem = {
        ...mockItem,
        id: 'item-2',
        endDate: new Date(Date.now() - 1000),
        status: FlashSaleStatus.ACTIVE,
      };

      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([active, expired]),
      };
      jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(qb as any);

      const result = await service.findAllActive();
      expect(result).toHaveLength(2);
      expect(result[1].status).toBe(FlashSaleStatus.ENDED);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when item missing', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });

    it('returns the item when found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockItem);
      const result = await service.findOne('item-1');
      expect(result.id).toBe('item-1');
    });
  });

  describe('create', () => {
    it('rejects startDate after endDate', async () => {
      await expect(
        service.create({
          title: 'Bad',
          category: 'X',
          price: 1,
          startDate: '2026-09-10T00:00:00.000Z',
          endDate: '2026-09-01T00:00:00.000Z',
        }),
      ).rejects.toThrow('startDate must be before endDate');
    });

    it('creates the item with defaults', async () => {
      const created = await service.create({
        title: 'Good',
        category: 'X',
        price: 1,
        startDate: '2026-09-01T00:00:00.000Z',
        endDate: '2026-09-10T00:00:00.000Z',
      });
      expect(created.status).toBe(FlashSaleStatus.ACTIVE);
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes the item', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockItem);
      jest.spyOn(repo, 'remove').mockResolvedValue(mockItem);
      await expect(service.remove('item-1')).resolves.toBeUndefined();
    });
  });
});
