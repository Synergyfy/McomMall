import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExchangeService } from './exchange.service';
import { ExchangeItem } from './entities/exchange-item.entity';
import { ExchangeProposal } from './entities/exchange-proposal.entity';
import { ExchangeHistory } from './entities/exchange-history.entity';
import { User } from '../users/entities/user.entity';
import { ItemStatus } from './entities/item-status.enum';
import { CreateExchangeItemDto } from './dto/create-exchange-item.dto';
import { Escrow } from './entities/escrow.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { ExchangeItemType } from './entities/exchange-item-type.enum';
import { ProposalStatus } from './entities/proposal-status.enum';
import { EscrowStatus } from './entities/escrow-status.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateExchangeProposalDto } from './dto/update-exchange-proposal.dto';

describe('ExchangeService', () => {
  let service: ExchangeService;

  const mockItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
  };

  const mockProposalRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockHistoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEscrowRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockProductRepository = {
    findOneBy: jest.fn(),
  };

  const mockServiceRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeService,
        {
          provide: getRepositoryToken(ExchangeItem),
          useValue: mockItemRepository,
        },
        {
          provide: getRepositoryToken(ExchangeProposal),
          useValue: mockProposalRepository,
        },
        {
          provide: getRepositoryToken(ExchangeHistory),
          useValue: mockHistoryRepository,
        },
        {
          provide: getRepositoryToken(Escrow),
          useValue: mockEscrowRepository,
        },
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

    service = module.get<ExchangeService>(ExchangeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createItem', () => {
    const owner = { id: 'user-id' } as User;

    it('should create a generic item', async () => {
      const createDto: CreateExchangeItemDto = {
        itemType: ExchangeItemType.GENERIC,
        title: 'Test Item',
        description: 'Test Description',
      };
      const savedItem = { ...createDto, owner, id: 'item-id' };

      mockItemRepository.create.mockReturnValue(savedItem);
      mockItemRepository.save.mockResolvedValue(savedItem);
      mockHistoryRepository.create.mockImplementation((h) => h);
      mockHistoryRepository.save.mockResolvedValue(undefined);

      const result = await service.createItem(createDto, owner);

      expect(mockItemRepository.create).toHaveBeenCalledWith({
        owner,
        itemType: 'generic',
        status: ItemStatus.AVAILABLE,
        title: 'Test Item',
        description: 'Test Description',
      });
      expect(result).toEqual(savedItem);
    });

    it('should create a product-based item', async () => {
      const product = {
        id: 'product-id',
        title: 'Test Product',
        description: 'Product Desc',
      } as Product;
      const createDto: CreateExchangeItemDto = {
        itemType: ExchangeItemType.PRODUCT,
        productId: 'product-id',
      };
      const savedItem = {
        id: 'item-id',
        owner,
        product,
        title: product.title,
        description: product.description,
      };

      mockProductRepository.findOneBy.mockResolvedValue(product);
      mockItemRepository.create.mockReturnValue(savedItem);
      mockItemRepository.save.mockResolvedValue(savedItem);
      mockHistoryRepository.create.mockImplementation((h) => h);
      mockHistoryRepository.save.mockResolvedValue(undefined);

      const result = await service.createItem(createDto, owner);

      expect(mockProductRepository.findOneBy).toHaveBeenCalledWith({
        id: 'product-id',
      });
      expect(mockItemRepository.create).toHaveBeenCalledWith({
        owner,
        itemType: 'product',
        status: ItemStatus.AVAILABLE,
        product,
        title: product.title,
        description: product.description,
      });
      expect(result).toEqual(savedItem);
    });

    it('should throw NotFoundException if product not found', async () => {
      const createDto: CreateExchangeItemDto = {
        itemType: ExchangeItemType.PRODUCT,
        productId: 'non-existent-id',
      };
      mockProductRepository.findOneBy.mockResolvedValue(null);
      await expect(service.createItem(createDto, owner)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('respondToProposal', () => {
    it('should accept a proposal and create an escrow', async () => {
      const receiver = { id: 'receiver-id' } as User;
      const proposal = {
        id: 'proposal-id',
        status: ProposalStatus.PENDING,
        offeredItem: { id: 'offered-item-id' },
        requestedItem: { id: 'requested-item-id' },
      } as unknown as ExchangeProposal;
      const updateDto: UpdateExchangeProposalDto = {
        status: ProposalStatus.ACCEPTED,
      };
      const savedEscrow = { id: 'escrow-id' };

      mockProposalRepository.findOne.mockResolvedValue(proposal);
      mockProposalRepository.save.mockResolvedValue({
        ...proposal,
        status: ProposalStatus.ACCEPTED,
      });
      mockHistoryRepository.create.mockImplementation((h) => h);
      mockHistoryRepository.save.mockResolvedValue(undefined);
      mockItemRepository.update.mockResolvedValue(undefined);
      mockEscrowRepository.create.mockReturnValue(savedEscrow);
      mockEscrowRepository.save.mockResolvedValue(savedEscrow);

      const result = await service.respondToProposal(
        'proposal-id',
        updateDto,
        receiver,
      );

      expect(result.status).toEqual(ProposalStatus.ACCEPTED);
      expect(mockEscrowRepository.create).toHaveBeenCalledWith({
        proposal: { ...proposal, status: ProposalStatus.ACCEPTED },
        status: EscrowStatus.PENDING,
      });
      expect(mockEscrowRepository.save).toHaveBeenCalledWith(savedEscrow);
      expect(mockItemRepository.update).toHaveBeenCalledWith(
        { id: 'offered-item-id' },
        { status: ItemStatus.IN_ESCROW },
      );
      expect(mockItemRepository.update).toHaveBeenCalledWith(
        { id: 'requested-item-id' },
        { status: ItemStatus.IN_ESCROW },
      );
    });
  });

  describe('confirmExchange', () => {
    const proposer = { id: 'proposer-id' } as User;
    const receiver = { id: 'receiver-id' } as User;

    it('should confirm for proposer and release when both confirmed', async () => {
      const escrow = {
        id: 'escrow-id',
        status: EscrowStatus.PENDING,
        proposerConfirmed: false,
        receiverConfirmed: true, // Receiver already confirmed
        proposal: {
          proposer,
          receiver,
          offeredItem: { id: 'item-1', ownerId: 'proposer-id' },
          requestedItem: { id: 'item-2', ownerId: 'receiver-id' },
        },
      } as unknown as Escrow;

      mockEscrowRepository.findOne.mockResolvedValue(escrow);
      mockEscrowRepository.save.mockImplementation((e) => Promise.resolve(e));
      mockItemRepository.save.mockResolvedValue(undefined);

      const result = await service.confirmExchange('escrow-id', 'proposer-id');

      expect(result.proposerConfirmed).toBe(true);
      expect(result.status).toBe(EscrowStatus.RELEASED);
      expect(mockItemRepository.save).toHaveBeenCalledWith([
        { id: 'item-1', ownerId: 'receiver-id', status: ItemStatus.TRADED },
        { id: 'item-2', ownerId: 'proposer-id', status: ItemStatus.TRADED },
      ]);
    });

    it('should throw BadRequestException if escrow is not pending', async () => {
      const escrow = {
        id: 'escrow-id',
        status: EscrowStatus.RELEASED,
        proposal: { proposer, receiver },
      } as Escrow;
      mockEscrowRepository.findOne.mockResolvedValue(escrow);

      await expect(
        service.confirmExchange('escrow-id', 'proposer-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelExchange', () => {
    const proposer = { id: 'proposer-id' } as User;
    const receiver = { id: 'receiver-id' } as User;
    const escrow = {
      id: 'escrow-id',
      status: EscrowStatus.PENDING,
      proposal: {
        proposer,
        receiver,
        offeredItem: { id: 'item-1' },
        requestedItem: { id: 'item-2' },
      },
    } as unknown as Escrow;

    it('should cancel the escrow and revert item statuses', async () => {
      mockEscrowRepository.findOne.mockResolvedValue(escrow);
      mockEscrowRepository.save.mockImplementation((e) => Promise.resolve(e));
      mockItemRepository.update.mockResolvedValue(undefined);

      const result = await service.cancelExchange('escrow-id', 'proposer-id');

      expect(result.status).toBe(EscrowStatus.CANCELLED);
      expect(mockItemRepository.update).toHaveBeenCalledWith(
        { id: 'item-1' },
        { status: ItemStatus.AVAILABLE },
      );
      expect(mockItemRepository.update).toHaveBeenCalledWith(
        { id: 'item-2' },
        { status: ItemStatus.AVAILABLE },
      );
    });
  });
});
