import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Partnership } from './entities/partnership.entity';
import { UserPartnership } from './entities/user-partnership.entity';
import { UserPartnershipRequest } from './entities/user-partnership-request.entity';
import { ItemPartnershipRequest } from './entities/item-partnership-request.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { User } from '../users/entities/user.entity';
import { CreateUserPartnershipRequestDto } from './dto/create-user-partnership-request.dto';
import { RespondToUserPartnershipRequestDto } from './dto/respond-to-user-partnership-request.dto';
import { CreateItemPartnershipRequestDto } from './dto/create-item-partnership-request.dto';
import { PartnershipStatus } from './partnership-status.enum';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class PartnershipService {
  constructor(
    @InjectRepository(Partnership)
    private readonly partnershipRepository: Repository<Partnership>,
    @InjectRepository(UserPartnership)
    private readonly userPartnershipRepository: Repository<UserPartnership>,
    @InjectRepository(UserPartnershipRequest)
    private readonly userPartnershipRequestRepository: Repository<UserPartnershipRequest>,
    @InjectRepository(ItemPartnershipRequest)
    private readonly itemPartnershipRequestRepository: Repository<ItemPartnershipRequest>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) { }

  async searchOwners(query: string, currentUserId: string): Promise<User[]> {
    return this.usersService.searchOwners(query, currentUserId);
  }

  // --- Search Partner Items ---

  async searchPartnerItems(query: string, currentUserId: string): Promise<any[]> {
    if (!query || query.length < 2) return [];

    const searchTerm = `%${query.trim()}%`;

    // Search Products
    const products = await this.productRepository.createQueryBuilder('p')
      .leftJoinAndSelect('p.business', 'b')
      .leftJoinAndSelect('b.user', 'u')
      .where('u.id != :currentUserId', { currentUserId })
      .andWhere(new Brackets(qb => {
        qb.where('p.title ILIKE :searchTerm', { searchTerm })
          .orWhere('p.description ILIKE :searchTerm', { searchTerm });
      }))
      .take(10)
      .getMany();

    // Search Services
    const services = await this.serviceRepository.createQueryBuilder('s')
      .leftJoinAndSelect('s.business', 'b')
      .leftJoinAndSelect('b.user', 'u')
      .where('u.id != :currentUserId', { currentUserId })
      .andWhere(new Brackets(qb => {
        qb.where('s.name ILIKE :searchTerm', { searchTerm })
          .orWhere('s.description ILIKE :searchTerm', { searchTerm });
      }))
      .take(10)
      .getMany();

    // Check partnership status for each owner found
    const ownerIds = new Set<string>();
    [...products, ...services].forEach(item => {
      if (item.business?.user?.id) ownerIds.add(item.business.user.id);
    });

    const activePartnerships = await this.userPartnershipRepository.find({
      where: [
        { user1: { id: currentUserId } },
        { user2: { id: currentUserId } }
      ],
      relations: ['user1', 'user2']
    });

    const partnerMap = new Map<string, boolean>();
    activePartnerships.forEach(p => {
      const partnerId = p.user1.id === currentUserId ? p.user2.id : p.user1.id;
      if (p.isActive) partnerMap.set(partnerId, true);
    });

    // Format Results
    const results = [];

    for (const p of products) {
      if (!p.business?.user) continue;
      const ownerId = p.business.user.id;
      results.push({
        type: 'product',
        id: p.id,
        title: p.title,
        image: p.media?.[0] || '',
        owner: {
          id: ownerId,
          name: `${p.business.user.firstName} ${p.business.user.lastName}`,
          email: p.business.user.email,
          profilePicture: p.business.user.profilePictureUrl
        },
        isPartner: partnerMap.has(ownerId)
      });
    }

    for (const s of services) {
      if (!s.business?.user) continue;
      const ownerId = s.business.user.id;
      results.push({
        type: 'service',
        id: s.id,
        title: s.name,
        image: s.media?.[0] || '',
        owner: {
          id: ownerId,
          name: `${s.business.user.firstName} ${s.business.user.lastName}`,
          email: s.business.user.email,
          profilePicture: s.business.user.profilePictureUrl
        },
        isPartner: partnerMap.has(ownerId)
      });
    }

    return results;
  }

  // --- Composite Request ---

  async createCompositePartnershipRequest(
    dto: CreateItemPartnershipRequestDto,
    currentUser: User
  ): Promise<{ userRequest: UserPartnershipRequest | null, itemRequest: ItemPartnershipRequest }> {
    // 1. Identify Target Owner
    let targetOwnerId: string;

    if (dto.plusProductId) {
      const p = await this.productRepository.findOne({ where: { id: dto.plusProductId }, relations: ['business', 'business.user'] });
      if (!p) throw new NotFoundException('Plus Product not found');
      targetOwnerId = p.business.user.id;
    } else if (dto.plusServiceId) {
      const s = await this.serviceRepository.findOne({ where: { id: dto.plusServiceId }, relations: ['business', 'business.user'] });
      if (!s) throw new NotFoundException('Plus Service not found');
      targetOwnerId = s.business.user.id;
    } else {
      throw new BadRequestException('Must provide a plus item');
    }

    if (targetOwnerId === currentUser.id) {
      throw new BadRequestException('Cannot partner with yourself');
    }

    const targetUser = await this.userRepository.findOne({ where: { id: targetOwnerId } });

    // 2. Check for Active Partnership
    let userPartnership = await this.userPartnershipRepository.findOne({
      where: [
        { user1: { id: currentUser.id }, user2: { id: targetOwnerId }, isActive: true },
        { user1: { id: targetOwnerId }, user2: { id: currentUser.id }, isActive: true }
      ]
    });

    let userRequest: UserPartnershipRequest | null = null;

    if (!userPartnership) {
      // Check for existing pending request
      userRequest = await this.userPartnershipRequestRepository.findOne({
        where: [
          { sender: { id: currentUser.id }, receiver: { id: targetOwnerId }, status: PartnershipStatus.PENDING },
          { sender: { id: targetOwnerId }, receiver: { id: currentUser.id }, status: PartnershipStatus.PENDING }
        ]
      });

      if (!userRequest) {
        // Create new User Partnership Request
        userRequest = this.userPartnershipRequestRepository.create({
          sender: currentUser,
          receiver: targetUser,
          status: PartnershipStatus.PENDING,
          sentAt: new Date(),
          message: dto.message,
        });
                        await this.userPartnershipRequestRepository.save(userRequest);
                        
                        await this.emailService.sendPartnershipRequestEmail(targetUser, currentUser);
                    }
                }
          
                // 3. Create Item Partnership Request (Orphan if no partnership yet)
                const baseItem = dto.baseProductId 
                  ? { id: dto.baseProductId } as Product 
                  : { id: dto.baseServiceId } as Service;
                  
                const plusItem = dto.plusProductId 
                  ? { id: dto.plusProductId } as Product 
                  : { id: dto.plusServiceId } as Service;
          
                const itemRequest = this.itemPartnershipRequestRepository.create({
          partnership: userPartnership || null, // Can be null now
          proposer: currentUser,
          receiver: targetUser,
          baseProduct: dto.baseProductId ? baseItem as Product : null,
          baseService: dto.baseServiceId ? baseItem as Service : null,
          plusProduct: dto.plusProductId ? plusItem as Product : null,
          plusService: dto.plusServiceId ? plusItem as Service : null,
          status: PartnershipStatus.PENDING,
          sentAt: new Date(),
          message: dto.message,
        });
          
                const savedItemRequest = await this.itemPartnershipRequestRepository.save(itemRequest);
          
                // Fetch details for email
                const fullBaseItem = dto.baseProductId 
                  ? await this.productRepository.findOne({ where: { id: dto.baseProductId } })
                  : await this.serviceRepository.findOne({ where: { id: dto.baseServiceId } });
                  
                const fullPlusItem = dto.plusProductId
                  ? await this.productRepository.findOne({ where: { id: dto.plusProductId } })
                  : await this.serviceRepository.findOne({ where: { id: dto.plusServiceId } });
          
                await this.emailService.sendPartnershipRequestEmail(targetUser, currentUser, {
                    baseItemName: (fullBaseItem as any)?.title || (fullBaseItem as any)?.name || 'Base Item',
                    plusItemName: (fullPlusItem as any)?.title || (fullPlusItem as any)?.name || 'Plus Item',
                });
          
                return { userRequest, itemRequest: savedItemRequest };
            }
          
  // --- User-to-User Partnerships ---

  async createUserPartnershipRequest(dto: CreateUserPartnershipRequestDto, sender: User): Promise<UserPartnershipRequest> {
    if (sender.id === dto.targetUserId) {
      throw new BadRequestException('You cannot partner with yourself');
    }

    const receiver = await this.userRepository.findOne({ where: { id: dto.targetUserId } });
    if (!receiver) {
      throw new NotFoundException('Target user not found');
    }

    const existingRequest = await this.userPartnershipRequestRepository.findOne({
      where: [
        { sender: { id: sender.id }, receiver: { id: receiver.id }, status: PartnershipStatus.PENDING },
        { sender: { id: receiver.id }, receiver: { id: sender.id }, status: PartnershipStatus.PENDING }
      ]
    });

    if (existingRequest) {
      throw new BadRequestException('A pending partnership request already exists between these users');
    }

    const request = this.userPartnershipRequestRepository.create({
      sender,
      receiver,
      status: PartnershipStatus.PENDING,
      sentAt: new Date(),
      message: dto.message,
    });

    const savedRequest = await this.userPartnershipRequestRepository.save(request);
    await this.emailService.sendPartnershipRequestEmail(receiver, sender);
    
    return savedRequest;
  }

  async respondToUserPartnershipRequest(id: string, dto: RespondToUserPartnershipRequestDto, user: User): Promise<UserPartnershipRequest> {
    const request = await this.userPartnershipRequestRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });

    if (!request) {
      throw new NotFoundException('Partnership request not found');
    }

    if (request.receiver.id !== user.id) {
      throw new UnauthorizedException('You are not authorized to respond to this request');
    }

    if (request.status !== PartnershipStatus.PENDING) {
      throw new BadRequestException('Request has already been processed');
    }

    request.status = dto.status;
    if (dto.status === PartnershipStatus.ACCEPTED) {
      request.acceptedAt = new Date();

      const partnership = this.userPartnershipRepository.create({
        user1: request.sender,
        user2: request.receiver,
        request,
        isActive: true,
      });
      const savedPartnership = await this.userPartnershipRepository.save(partnership);

      // Link any orphan item requests
      const orphanRequests = await this.itemPartnershipRequestRepository.find({
        where: [
          { proposer: { id: request.sender.id }, receiver: { id: request.receiver.id }, status: PartnershipStatus.PENDING, partnership: null },
          { proposer: { id: request.receiver.id }, receiver: { id: request.sender.id }, status: PartnershipStatus.PENDING, partnership: null }
        ]
      });

      for (const orphan of orphanRequests) {
        orphan.partnership = savedPartnership;
        await this.itemPartnershipRequestRepository.save(orphan);
      }

    } else {
      request.rejectedAt = new Date();
      request.rejectionMessage = dto.rejectionMessage;
    }

    return this.userPartnershipRequestRepository.save(request);
  }

  async getReceivedUserRequests(user: User): Promise<UserPartnershipRequest[]> {
    return this.userPartnershipRequestRepository.find({
      where: { receiver: { id: user.id } },
      relations: ['sender'],
      order: { sentAt: 'DESC' }
    });
  }

  async getSentUserRequests(user: User): Promise<UserPartnershipRequest[]> {
    return this.userPartnershipRequestRepository.find({
      where: { sender: { id: user.id } },
      relations: ['receiver'],
      order: { sentAt: 'DESC' }
    });
  }

  async getReceivedItemRequests(user: User): Promise<ItemPartnershipRequest[]> {
    return this.itemPartnershipRequestRepository.find({
      where: { receiver: { id: user.id } },
      relations: ['proposer', 'baseProduct', 'baseService', 'plusProduct', 'plusService', 'partnership'],
      order: { sentAt: 'DESC' }
    });
  }

  async getSentItemRequests(user: User): Promise<ItemPartnershipRequest[]> {
    return this.itemPartnershipRequestRepository.find({
      where: { proposer: { id: user.id } },
      relations: ['receiver', 'baseProduct', 'baseService', 'plusProduct', 'plusService', 'partnership'],
      order: { sentAt: 'DESC' }
    });
  }

  async getMyPartners(user: User): Promise<any[]> {
    const partnerships = await this.userPartnershipRepository.find({
      where: [
        { user1: { id: user.id }, isActive: true },
        { user2: { id: user.id }, isActive: true },
      ],
      relations: [
        'user1', 'user1.businesses', 'user1.businesses.location',
        'user2', 'user2.businesses', 'user2.businesses.location',
        'request'
      ],
    });

    return partnerships.map(p => {
      const partner = p.user1.id === user.id ? p.user2 : p.user1;
      const postcodes = partner.businesses?.map(b => b.location?.postcode).filter(Boolean) || [];
      return {
        partnershipId: p.id,
        partnerId: partner.id,
        partnerName: `${partner.firstName} ${partner.lastName}`,
        partnerEmail: partner.email,
        partnerProfilePicture: partner.profilePictureUrl,
        postcodes: Array.from(new Set(postcodes)),
        acceptedAt: p.request?.acceptedAt,
      };
    });
  }

  // --- Item "Plus" Partnerships ---

  async createItemPartnershipRequest(dto: CreateItemPartnershipRequestDto, proposer: User): Promise<ItemPartnershipRequest> {
    const partnership = await this.userPartnershipRepository.findOne({
      where: { id: dto.userPartnershipId, isActive: true },
      relations: ['user1', 'user2']
    });

    if (!partnership) {
      throw new NotFoundException('Active user partnership not found');
    }

    if (partnership.user1.id !== proposer.id && partnership.user2.id !== proposer.id) {
      throw new UnauthorizedException('You are not part of this partnership');
    }

    const partnerId = partnership.user1.id === proposer.id ? partnership.user2.id : partnership.user1.id;
    const partner = await this.userRepository.findOne({ where: { id: partnerId } });

    // Validate ownership
    if (dto.baseProductId) {
      const p = await this.productRepository.findOne({ where: { id: dto.baseProductId }, relations: ['business', 'business.user'] });
      if (!p || p.business.user.id !== proposer.id) throw new BadRequestException('You do not own the base product');
    }
    if (dto.baseServiceId) {
      const s = await this.serviceRepository.findOne({ where: { id: dto.baseServiceId }, relations: ['business', 'business.user'] });
      if (!s || s.business.user.id !== proposer.id) throw new BadRequestException('You do not own the base service');
    }
    if (dto.plusProductId) {
      const p = await this.productRepository.findOne({ where: { id: dto.plusProductId }, relations: ['business', 'business.user'] });
      if (!p || p.business.user.id !== partnerId) throw new BadRequestException('Partner does not own the plus product');
    }
    if (dto.plusServiceId) {
      const s = await this.serviceRepository.findOne({ where: { id: dto.plusServiceId }, relations: ['business', 'business.user'] });
      if (!s || s.business.user.id !== partnerId) throw new BadRequestException('Partner does not own the plus service');
    }

    const request = this.itemPartnershipRequestRepository.create({
      partnership,
      proposer,
      receiver: partner,
      baseProduct: dto.baseProductId ? { id: dto.baseProductId } as Product : null,
      baseService: dto.baseServiceId ? { id: dto.baseServiceId } as Service : null,
      plusProduct: dto.plusProductId ? { id: dto.plusProductId } as Product : null,
      plusService: dto.plusServiceId ? { id: dto.plusServiceId } as Service : null,
      status: PartnershipStatus.PENDING,
      sentAt: new Date(),
      message: dto.message,
    });

    const savedRequest = await this.itemPartnershipRequestRepository.save(request);

    // Fetch details for email
    const fullBaseItem = dto.baseProductId 
      ? await this.productRepository.findOne({ where: { id: dto.baseProductId } })
      : await this.serviceRepository.findOne({ where: { id: dto.baseServiceId } });
      
    const fullPlusItem = dto.plusProductId
      ? await this.productRepository.findOne({ where: { id: dto.plusProductId } })
      : await this.serviceRepository.findOne({ where: { id: dto.plusServiceId } });

    await this.emailService.sendPartnershipRequestEmail(partner, proposer, {
        baseItemName: (fullBaseItem as any)?.title || (fullBaseItem as any)?.name || 'Base Item',
        plusItemName: (fullPlusItem as any)?.title || (fullPlusItem as any)?.name || 'Plus Item',
    });

    return savedRequest;
  }

  async respondToItemPartnershipRequest(id: string, dto: RespondToUserPartnershipRequestDto, user: User): Promise<ItemPartnershipRequest> {
    const request = await this.itemPartnershipRequestRepository.findOne({
      where: { id },
      relations: ['partnership', 'partnership.user1', 'partnership.user2', 'baseProduct', 'baseService', 'plusProduct', 'plusService', 'proposer'],
    });

    if (!request) {
      throw new NotFoundException('Item partnership request not found');
    }

    // If partnership is null, check if one has been formed in the meantime (edge case) or deny
    // Ideally it should be linked by now.

    // Check authorization: Must be the RECEIVER
    if (request.partnership) {
      const partnerId = request.partnership.user1.id === request.proposer.id ? request.partnership.user2.id : request.partnership.user1.id;
      if (partnerId !== user.id) {
        throw new UnauthorizedException('You are not authorized to respond to this request');
      }
    } else {
      // Fallback using receiver field if partnership not yet linked (though it should be for acceptance)
      // Actually, if partnership is null, we can't accept it yet according to rules.
      // But for rejection it's fine.
    }

    // ENFORCE: Cannot accept item request if user partnership is not active/linked
    if (dto.status === PartnershipStatus.ACCEPTED && !request.partnership) {
      throw new BadRequestException('Cannot accept item request until user partnership is active');
    }


    request.status = dto.status;
    if (dto.status === PartnershipStatus.ACCEPTED) {
      request.acceptedAt = new Date();

      const activePartnership = this.partnershipRepository.create({
        baseProduct: request.baseProduct,
        baseService: request.baseService,
        plusProduct: request.plusProduct,
        plusService: request.plusService,
        itemPartnershipRequest: request,
        isActive: true,
      });
      await this.partnershipRepository.save(activePartnership);
    } else {
      request.rejectedAt = new Date();
      request.rejectionMessage = dto.rejectionMessage;
    }

    return this.itemPartnershipRequestRepository.save(request);
  }

  async getPartnerItems(partnershipId: string, user: User): Promise<any> {
    const partnership = await this.userPartnershipRepository.findOne({
      where: { id: partnershipId, isActive: true },
      relations: ['user1', 'user2']
    });

    if (!partnership) throw new NotFoundException('Partnership not found');
    if (partnership.user1.id !== user.id && partnership.user2.id !== user.id) throw new UnauthorizedException();

    const partnerId = partnership.user1.id === user.id ? partnership.user2.id : partnership.user1.id;

    // Find all active product/service links for this specific partnership
    const activeLinks = await this.partnershipRepository.find({
      where: {
        itemPartnershipRequest: { partnership: { id: partnershipId } },
        isActive: true
      },
      relations: ['baseProduct', 'baseService', 'plusProduct', 'plusService']
    });

    return {
      activeLinks
    };
  }

  async getProductPartnerships(productId: string): Promise<Service[]> {
    const partnerships = await this.partnershipRepository.find({
      where: [
        { baseProduct: { id: productId }, isActive: true },
        { plusProduct: { id: productId }, isActive: true },
      ],
      relations: ['baseProduct', 'plusService', 'plusProduct', 'baseService'],
    });

    const services: Service[] = [];
    for (const p of partnerships) {
      if (p.baseProduct?.id === productId && p.plusService) {
        services.push(p.plusService);
      } else if (p.plusProduct?.id === productId && p.baseService) {
        services.push(p.baseService);
      }
    }
    return services;
  }

  async getServicePartnerships(serviceId: string): Promise<any[]> {
    const partnerships = await this.partnershipRepository.find({
      where: [
        { baseService: { id: serviceId }, isActive: true },
        { plusService: { id: serviceId }, isActive: true },
      ],
      relations: ['baseProduct', 'plusService', 'plusProduct', 'baseService'],
    });

    const items: any[] = [];
    for (const p of partnerships) {
      if (p.baseService?.id === serviceId) {
        if (p.plusProduct) items.push({ ...p.plusProduct, type: 'product' });
        if (p.plusService) items.push({ ...p.plusService, type: 'service' });
      } else if (p.plusService?.id === serviceId) {
        if (p.baseProduct) items.push({ ...p.baseProduct, type: 'product' });
        if (p.baseService) items.push({ ...p.baseService, type: 'service' });
      }
    }
    return items;
  }

  async getAnalytics(user: User): Promise<any> {
    const totalPartners = await this.userPartnershipRepository.count({
      where: [
        { user1: { id: user.id }, isActive: true },
        { user2: { id: user.id }, isActive: true },
      ]
    });

    const pendingRequests = await this.userPartnershipRequestRepository.count({
      where: { receiver: { id: user.id }, status: PartnershipStatus.PENDING }
    });

    const itemRequests = await this.itemPartnershipRequestRepository.count({
      where: {
        partnership: [
          { user1: { id: user.id }, isActive: true },
          { user2: { id: user.id }, isActive: true },
        ],
        status: PartnershipStatus.PENDING
      }
    });

    return {
      totalPartners,
      pendingUserRequests: pendingRequests,
      pendingItemRequests: itemRequests,
    };
  }
}
