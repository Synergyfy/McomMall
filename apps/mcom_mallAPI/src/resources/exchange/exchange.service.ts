import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeItem } from './entities/exchange-item.entity';
import { ExchangeProposal } from './entities/exchange-proposal.entity';
import { ExchangeHistory } from './entities/exchange-history.entity';
import { CreateExchangeItemDto } from './dto/create-exchange-item.dto';
import { User } from '../users/entities/user.entity';
import { ItemStatus } from './entities/item-status.enum';
import { ExchangeHistoryAction } from './entities/exchange-history-action.enum';
import { UpdateExchangeItemDto } from './dto/update-exchange-item.dto';
import { CreateExchangeProposalDto } from './dto/create-exchange-proposal.dto';
import { ProposalStatus } from './entities/proposal-status.enum';
import { UpdateExchangeProposalDto } from './dto/update-exchange-proposal.dto';
import { Escrow } from './entities/escrow.entity';
import { EscrowStatus } from './entities/escrow-status.enum';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { ExchangeItemType } from './entities/exchange-item-type.enum';

@Injectable()
export class ExchangeService {
  constructor(
    @InjectRepository(ExchangeItem)
    private readonly itemRepository: Repository<ExchangeItem>,
    @InjectRepository(ExchangeProposal)
    private readonly proposalRepository: Repository<ExchangeProposal>,
    @InjectRepository(ExchangeHistory)
    private readonly historyRepository: Repository<ExchangeHistory>,
    @InjectRepository(Escrow)
    private readonly escrowRepository: Repository<Escrow>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  private async createHistory(
    actor: User,
    action: ExchangeHistoryAction,
    item?: ExchangeItem,
    proposal?: ExchangeProposal,
    detailsBefore?: object,
    detailsAfter?: object,
  ) {
    const history = this.historyRepository.create({
      actor,
      action,
      item,
      proposal,
      detailsBefore,
      detailsAfter,
    });
    return this.historyRepository.save(history);
  }

  async createItem(
    createDto: CreateExchangeItemDto,
    owner: User,
  ): Promise<ExchangeItem> {
    const { itemType, productId, serviceId, title, description } = createDto;

    const itemData: Partial<ExchangeItem> = {
      owner,
      itemType,
      status: ItemStatus.AVAILABLE,
    };

    if (itemType === ExchangeItemType.PRODUCT) {
      if (!productId) {
        throw new BadRequestException(
          'productId must be provided for products.',
        );
      }
      const product = await this.productRepository.findOneBy({ id: productId });
      if (!product) {
        throw new NotFoundException('Product not found.');
      }
      itemData.product = product;
      itemData.title = product.title;
      itemData.description = product.description;
    } else if (itemType === ExchangeItemType.SERVICE) {
      if (!serviceId) {
        throw new BadRequestException(
          'serviceId must be provided for services.',
        );
      }
      const service = await this.serviceRepository.findOneBy({ id: serviceId });
      if (!service) {
        throw new NotFoundException('Service not found.');
      }
      itemData.service = service;
      itemData.title = service.name;
      itemData.description = service.description;
    } else {
      if (!title || !description) {
        throw new BadRequestException(
          'Title and description are required for generic items.',
        );
      }
      itemData.title = title;
      itemData.description = description;
    }

    const newItem = this.itemRepository.create(itemData);
    const savedItem = await this.itemRepository.save(newItem);

    await this.createHistory(
      owner,
      ExchangeHistoryAction.ITEM_CREATED,
      savedItem,
      null,
      {},
      savedItem,
    );

    return savedItem;
  }

  async updateItem(
    itemId: string,
    updateDto: UpdateExchangeItemDto,
    userId: string,
  ): Promise<ExchangeItem> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['owner'],
    });

    if (!item) {
      throw new NotFoundException('Item not found.');
    }

    if (item.owner.id !== userId) {
      throw new UnauthorizedException('You are not the owner of this item.');
    }

    const detailsBefore = { ...item };
    Object.assign(item, updateDto);
    const updatedItem = await this.itemRepository.save(item);

    await this.createHistory(
      item.owner,
      ExchangeHistoryAction.ITEM_UPDATED,
      updatedItem,
      null,
      detailsBefore,
      updatedItem,
    );

    return updatedItem;
  }

  async createProposal(
    createDto: CreateExchangeProposalDto,
    proposer: User,
  ): Promise<ExchangeProposal> {
    const { offeredItemId, requestedItemId } = createDto;

    const offeredItem = await this.itemRepository.findOne({
      where: { id: offeredItemId, ownerId: proposer.id },
      relations: ['owner'],
    });

    if (!offeredItem || offeredItem.status !== ItemStatus.AVAILABLE) {
      throw new NotFoundException(
        'Your offered item is not available for trade.',
      );
    }

    const requestedItem = await this.itemRepository.findOne({
      where: { id: requestedItemId },
      relations: ['owner'],
    });

    if (!requestedItem || requestedItem.status !== ItemStatus.AVAILABLE) {
      throw new NotFoundException(
        'The requested item is not available for trade.',
      );
    }

    if (offeredItem.owner.id === requestedItem.owner.id) {
      throw new UnauthorizedException('You cannot trade with yourself.');
    }

    const newProposal = this.proposalRepository.create({
      proposer,
      receiver: requestedItem.owner,
      offeredItem,
      requestedItem,
      status: ProposalStatus.PENDING,
    });

    const savedProposal = await this.proposalRepository.save(newProposal);

    await this.createHistory(
      proposer,
      ExchangeHistoryAction.PROPOSAL_CREATED,
      null,
      savedProposal,
    );

    return savedProposal;
  }

  async respondToProposal(
    proposalId: string,
    updateDto: UpdateExchangeProposalDto,
    receiver: User,
  ): Promise<ExchangeProposal> {
    const proposal = await this.proposalRepository.findOne({
      where: { id: proposalId, receiverId: receiver.id },
      relations: [
        'proposer',
        'receiver',
        'offeredItem',
        'requestedItem',
        'offeredItem.owner',
        'requestedItem.owner',
      ],
    });

    if (!proposal) {
      throw new NotFoundException(
        'Proposal not found or you are not the receiver.',
      );
    }

    if (proposal.status !== ProposalStatus.PENDING) {
      throw new UnauthorizedException(
        'This proposal has already been responded to.',
      );
    }

    const detailsBefore = { ...proposal };
    proposal.status = updateDto.status;
    const updatedProposal = await this.proposalRepository.save(proposal);

    const action =
      updateDto.status === ProposalStatus.ACCEPTED
        ? ExchangeHistoryAction.PROPOSAL_ACCEPTED
        : ExchangeHistoryAction.PROPOSAL_REJECTED;

    await this.createHistory(
      receiver,
      action,
      null,
      updatedProposal,
      detailsBefore,
      updatedProposal,
    );

    if (updatedProposal.status === ProposalStatus.ACCEPTED) {
      const escrow = this.escrowRepository.create({
        proposal: updatedProposal,
        status: EscrowStatus.PENDING,
      });
      await this.escrowRepository.save(escrow);

      await this.itemRepository.update(
        { id: proposal.offeredItem.id },
        { status: ItemStatus.IN_ESCROW },
      );
      await this.itemRepository.update(
        { id: proposal.requestedItem.id },
        { status: ItemStatus.IN_ESCROW },
      );
    }

    return updatedProposal;
  }

  async confirmExchange(escrowId: string, userId: string): Promise<Escrow> {
    const escrow = await this.escrowRepository.findOne({
      where: { id: escrowId },
      relations: [
        'proposal',
        'proposal.proposer',
        'proposal.receiver',
        'proposal.offeredItem',
        'proposal.requestedItem',
      ],
    });

    if (!escrow) {
      throw new NotFoundException('Escrow not found.');
    }

    const { proposal } = escrow;
    const isProposer = proposal.proposer.id === userId;
    const isReceiver = proposal.receiver.id === userId;

    if (!isProposer && !isReceiver) {
      throw new UnauthorizedException('You are not part of this exchange.');
    }

    if (escrow.status !== EscrowStatus.PENDING) {
      throw new BadRequestException('This escrow is not pending confirmation.');
    }

    if (isProposer) {
      escrow.proposerConfirmed = true;
    } else {
      escrow.receiverConfirmed = true;
    }

    if (escrow.proposerConfirmed && escrow.receiverConfirmed) {
      escrow.status = EscrowStatus.RELEASED;

      // Swap owners
      const offeredItem = proposal.offeredItem;
      const requestedItem = proposal.requestedItem;
      const proposerId = proposal.proposer.id;
      const receiverId = proposal.receiver.id;

      offeredItem.ownerId = receiverId;
      requestedItem.ownerId = proposerId;

      offeredItem.status = ItemStatus.TRADED;
      requestedItem.status = ItemStatus.TRADED;

      await this.itemRepository.save([offeredItem, requestedItem]);
    }

    return this.escrowRepository.save(escrow);
  }

  async cancelExchange(escrowId: string, userId: string): Promise<Escrow> {
    const escrow = await this.escrowRepository.findOne({
      where: { id: escrowId },
      relations: [
        'proposal',
        'proposal.proposer',
        'proposal.receiver',
        'proposal.offeredItem',
        'proposal.requestedItem',
      ],
    });

    if (!escrow) {
      throw new NotFoundException('Escrow not found.');
    }

    const { proposal } = escrow;
    if (proposal.proposer.id !== userId && proposal.receiver.id !== userId) {
      throw new UnauthorizedException('You are not part of this exchange.');
    }

    if (escrow.status !== EscrowStatus.PENDING) {
      throw new BadRequestException('This escrow cannot be cancelled.');
    }

    escrow.status = EscrowStatus.CANCELLED;

    await this.itemRepository.update(
      { id: proposal.offeredItem.id },
      { status: ItemStatus.AVAILABLE },
    );
    await this.itemRepository.update(
      { id: proposal.requestedItem.id },
      { status: ItemStatus.AVAILABLE },
    );

    return this.escrowRepository.save(escrow);
  }

  async findAllItems(options: {
    page: number;
    limit: number;
  }): Promise<{ items: ExchangeItem[]; total: number }> {
    const [items, total] = await this.itemRepository.findAndCount({
      where: { status: ItemStatus.AVAILABLE },
      relations: ['owner', 'product', 'service'],
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total };
  }

  async findOneItem(itemId: string): Promise<ExchangeItem> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['owner', 'product', 'service'],
    });

    if (!item) {
      throw new NotFoundException('Item not found.');
    }

    return item;
  }

  async findProposals(
    userId: string,
    type: 'sent' | 'received',
  ): Promise<ExchangeProposal[]> {
    const whereCondition =
      type === 'sent'
        ? { proposer: { id: userId } }
        : { receiver: { id: userId } };

    return this.proposalRepository.find({
      where: whereCondition,
      relations: [
        'proposer',
        'receiver',
        'offeredItem',
        'requestedItem',
        'offeredItem.product',
        'offeredItem.service',
        'requestedItem.product',
        'requestedItem.service',
      ],
      order: { createdAt: 'DESC' },
    });
  }
}
