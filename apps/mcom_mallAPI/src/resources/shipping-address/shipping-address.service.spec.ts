import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShippingAddressService } from './shipping-address.service';
import { ShippingAddress } from './entities/shipping-address.entity';
import { User } from '../users/entities/user.entity';

describe('ShippingAddressService', () => {
  let service: ShippingAddressService;

  const mockUser = { id: 'user-1' } as User;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingAddressService,
        {
          provide: getRepositoryToken(ShippingAddress),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ShippingAddressService>(ShippingAddressService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a first address as main automatically', async () => {
      const dto = {
        addressName: 'Home',
        recipientName: 'John',
        phoneNumber: '123',
        addressLine1: 'St 1',
        city: 'NYC',
        state: 'NY',
        country: 'USA',
      };

      mockRepository.count.mockResolvedValue(0);
      mockRepository.create.mockReturnValue({
        ...dto,
        isMain: true,
        user: mockUser,
      });
      mockRepository.save.mockResolvedValue({
        id: 'addr-1',
        ...dto,
        isMain: true,
      });

      const result = await service.create(mockUser, dto);

      expect(mockRepository.count).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isMain: true }),
      );
      expect(result.isMain).toBe(true);
    });

    it('should unset previous main if new address is marked as main', async () => {
      const dto = {
        addressName: 'Office',
        isMain: true,
        recipientName: 'John',
        phoneNumber: '123',
        addressLine1: 'St 2',
        city: 'NYC',
        state: 'NY',
        country: 'USA',
      };

      mockRepository.count.mockResolvedValue(1);
      mockRepository.create.mockReturnValue({ ...dto, user: mockUser });
      mockRepository.save.mockResolvedValue({ id: 'addr-2', ...dto });

      await service.create(mockUser, dto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { user: { id: 'user-1' }, isMain: true },
        { isMain: false },
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated result', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);
      const result = await service.findAll('user-1', 1, 10);
      expect(result.data).toBeDefined();
      expect(result.totalPages).toBe(0);
    });
  });

  describe('remove', () => {
    it('should promote next address to main if main is deleted', async () => {
      const mainAddr = { id: 'addr-1', isMain: true };
      const nextAddr = { id: 'addr-2', isMain: false };

      mockRepository.findOne.mockResolvedValueOnce(mainAddr); // findOne inside remove
      mockRepository.remove.mockResolvedValue(mainAddr);
      mockRepository.findOne.mockResolvedValueOnce(nextAddr); // findOne for promotion

      await service.remove('user-1', 'addr-1');

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'addr-2', isMain: true }),
      );
    });
  });

  describe('setMain', () => {
    it('should set an address as main and unset others', async () => {
      const targetAddr = { id: 'addr-2', isMain: false };
      mockRepository.findOne.mockResolvedValue(targetAddr);

      await service.setMain('user-1', 'addr-2');

      expect(mockRepository.update).toHaveBeenCalledWith(
        { user: { id: 'user-1' }, isMain: true },
        { isMain: false },
      );
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isMain: true }),
      );
    });
  });
});
