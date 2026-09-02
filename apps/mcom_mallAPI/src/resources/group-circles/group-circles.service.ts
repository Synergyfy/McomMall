import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupMemberStatus } from './group-member-status.enum';
import { MemberRole } from './member-role.enum';
import { GroupWallet } from './entities/group-wallet.entity';
import { GroupStatus } from './group-status.enum';
import { GroupTransaction } from './entities/group-transaction.entity';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { CashbackEvent } from '../../common/enums/cashback-event.enum';
import {
  CapabilityService,
  ActionType,
} from '../capability/capability.service';
import {
  GroupCircleMessage,
  GroupMessageType,
} from './entities/group-circle-message.entity';
import { UsersService } from '../users/users.service';
import { GeolocationService } from './geolocation.service';

@Injectable()
export class GroupCirclesService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(GroupTransaction)
    private readonly groupTransactionRepository: Repository<GroupTransaction>,
    @InjectRepository(GroupCircleMessage)
    private readonly messageRepository: Repository<GroupCircleMessage>,
    private readonly dataSource: DataSource,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly centralIntegrationService: CentralIntegrationService,
    private readonly capabilityService: CapabilityService,
    private readonly usersService: UsersService,
    private readonly geolocationService: GeolocationService,
  ) {}

  async getReferredBusinesses(user: User): Promise<any[]> {
    return this.usersService.getReferredBusinesses(user.id);
  }

  private formatGroupCircle(group: Group) {
    return {
      id: group.id,
      name: group.name,
      type: group.type,
      duration: group.duration,
      contributionAmount: Number(group.contributionAmount),
      payoutFrequency: group.payoutFrequency,
      currentRound: group.currentRound,
      startDate: group.startDate,
      status: group.status,
      members: (group.members || []).map((gm) => ({
        id: gm.id,
        role: gm.role,
        drawDate: gm.drawDate,
        status: gm.status,
        network: gm.user
          ? {
              id: gm.user.id,
              fullName: `${gm.user.firstName} ${gm.user.lastName}`,
              email: gm.user.email,
              profilePictureUrl: gm.user.profilePictureUrl,
              businessName: gm.user.firstName + "'s Business",
            }
          : null,
      })),
      wallet: group.wallet,
    };
  }

  async create(createGroupDto: CreateGroupDto, founder: User): Promise<any> {
    const savedGroup = await this.dataSource.transaction(async (manager) => {
      await this.capabilityService.checkPermission(
        founder.id,
        ActionType.CREATE_GROUP,
      );

      const group = manager.create(Group, {
        ...createGroupDto,
        founder,
        status: GroupStatus.ACTIVE,
        startDate: new Date(),
      });
      const saved = await manager.save(group);

      const groupWallet = manager.create(GroupWallet, {
        group: saved,
        balance: 0,
      });
      await manager.save(groupWallet);

      const founderMember = manager.create(GroupMember, {
        group: saved,
        user: founder,
        role: MemberRole.OWNER,
        status: GroupMemberStatus.ACTIVE,
      });
      await manager.save(founderMember);

      if (createGroupDto.networkIds && createGroupDto.networkIds.length > 0) {
        // Batch-load users to avoid N+1
        const networkUsers = await manager.find(User, {
          where: { id: In(createGroupDto.networkIds) },
        });
        const networkUserMap = new Map(networkUsers.map(u => [u.id, u]));
        
        for (const userId of createGroupDto.networkIds) {
          const user = networkUserMap.get(userId);
          if (user) {
            const member = manager.create(GroupMember, {
              group: saved,
              user,
              role: MemberRole.MEMBER,
              status: GroupMemberStatus.PENDING_PAYMENT,
            });
            await manager.save(member);
          }
        }
      }

      if (
        createGroupDto.referredBusinessIds &&
        createGroupDto.referredBusinessIds.length > 0
      ) {
        // Batch-load users to avoid N+1
        const referredUsers = await manager.find(User, {
          where: { id: In(createGroupDto.referredBusinessIds) },
        });
        const referredUserMap = new Map(referredUsers.map(u => [u.id, u]));
        
        for (const userId of createGroupDto.referredBusinessIds) {
          const user = referredUserMap.get(userId);
          if (user) {
            const member = manager.create(GroupMember, {
              group: saved,
              user,
              role: MemberRole.MEMBER,
              status: GroupMemberStatus.PENDING_PAYMENT,
            });
            await manager.save(member);
          }
        }
      }

      return saved;
    });

    return this.findOne(savedGroup.id, founder);
  }

  async update(
    id: string,
    updateGroupDto: UpdateGroupDto,
    user: User,
  ): Promise<any> {
    const group = await this.groupRepository.findOne({
      where: { id, founderId: user.id },
    });
    if (!group)
      throw new NotFoundException(
        'Group circle not found or you are not the owner',
      );

    Object.assign(group, updateGroupDto);
    await this.groupRepository.save(group);
    return this.findOne(id, user);
  }

  async findAll(
    user: User,
    params: { page: number; limit: number },
  ): Promise<any> {
    const [memberships, total] = await this.groupMemberRepository.findAndCount({
      where: { userId: user.id },
      relations: [
        'group',
        'group.members',
        'group.members.user',
        'group.wallet',
      ],
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: memberships.map((m) => this.formatGroupCircle(m.group)),
      meta: {
        total,
        page: params.page,
        lastPage: Math.ceil(total / params.limit),
      },
    };
  }

  async findOne(id: string, user: User): Promise<any> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['members', 'members.user', 'wallet'],
    });

    if (!group) throw new NotFoundException('Group circle not found');

    const isMember = group.members.some((m) => m.userId === user.id);
    if (!isMember)
      throw new ForbiddenException('You are not a member of this group circle');

    return this.formatGroupCircle(group);
  }

  async joinGroup(id: string, user: User): Promise<any> {
    const group = await this.groupRepository.findOne({ where: { id } });
    if (!group) throw new NotFoundException('Group circle not found');

    const existing = await this.groupMemberRepository.findOne({
      where: { groupId: id, userId: user.id },
    });
    if (existing) throw new ConflictException('Already a member');

    const member = this.groupMemberRepository.create({
      group,
      user,
      role: MemberRole.MEMBER,
      status: GroupMemberStatus.ACTIVE,
    });

    await this.groupMemberRepository.save(member);
    return this.findOne(id, user);
  }

  async removeMember(id: string, memberId: string, user: User): Promise<void> {
    const group = await this.groupRepository.findOne({ where: { id } });
    if (!group) throw new NotFoundException('Group circle not found');

    const myMembership = await this.groupMemberRepository.findOne({
      where: { groupId: id, userId: user.id },
    });
    if (
      !myMembership ||
      (myMembership.role !== MemberRole.OWNER &&
        myMembership.role !== MemberRole.ADMIN)
    ) {
      if (myMembership.id !== memberId) {
        throw new ForbiddenException(
          'Only owners or admins can remove other members',
        );
      }
    }

    await this.groupMemberRepository.delete(memberId);
  }

  async addMembers(id: string, data: any, user: User): Promise<void> {
    const group = await this.groupRepository.findOne({ where: { id } });
    if (!group) throw new NotFoundException('Group circle not found');

    const myMembership = await this.groupMemberRepository.findOne({
      where: { groupId: id, userId: user.id },
    });
    if (
      !myMembership ||
      (myMembership.role !== MemberRole.OWNER &&
        myMembership.role !== MemberRole.ADMIN)
    ) {
      throw new ForbiddenException('Only owners or admins can add members');
    }

    const networkId = data.networkId;
    if (!networkId) throw new BadRequestException('networkId is required');

    const targetUser = await this.dataSource.manager.findOne(User, {
      where: { id: networkId },
    });
    if (!targetUser) throw new NotFoundException('Target user not found');

    const existing = await this.groupMemberRepository.findOne({
      where: { groupId: id, userId: networkId },
    });
    if (existing) throw new ConflictException('User is already a member');

    const member = this.groupMemberRepository.create({
      group,
      user: targetUser,
      role: data.role || MemberRole.MEMBER,
      status: GroupMemberStatus.PENDING_PAYMENT,
    });

    await this.groupMemberRepository.save(member);
  }

  async getMessages(id: string, user: User, params: any): Promise<any> {
    const [messages, total] = await this.messageRepository.findAndCount({
      where: { groupId: id },
      relations: ['sender'],
      order: { created_at: 'DESC' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    return {
      data: messages
        .map((m) => ({
          id: m.id,
          content: m.content,
          type: m.type,
          senderName: `${m.sender.firstName} ${m.sender.lastName}`,
          senderId: m.senderId,
          recipientId: m.recipientId,
          createdAt: m.created_at,
        }))
        .reverse(),
      meta: {
        total,
        page: params.page,
        lastPage: Math.ceil(total / params.limit),
      },
    };
  }

  async sendMessage(
    id: string,
    data: any,
    user: User,
  ): Promise<GroupCircleMessage> {
    const message = this.messageRepository.create({
      groupId: id,
      senderId: user.id,
      content: data.content,
      type: data.recipientId ? GroupMessageType.DIRECT : GroupMessageType.GROUP,
      recipientId: data.recipientId,
    });

    return this.messageRepository.save(message);
  }

  async discover(user: User, postcode?: string): Promise<any> {
    const circles = await this.groupRepository.find({
      take: 100, // Fetch more to allow for filtering and distance sorting
      relations: [
        'founder',
        'founder.shippingAddresses',
        'founder.businesses',
        'founder.businesses.location',
        'members',
        'members.user',
        'wallet',
      ],
      order: { created_at: 'DESC' },
    });

    // Filter out circles where the user is the founder or already a member
    const filteredCircles = circles.filter((c) => {
      const isFounder = c.founderId === user.id;
      const isMember = (c.members || []).some((m) => m.userId === user.id);
      return !isFounder && !isMember;
    });

    let mappedCircles = filteredCircles.map((c) => ({
      ...this.formatGroupCircle(c),
      ownerName: `${c.founder.firstName} ${c.founder.lastName}`,
      memberCount: c.members.length,
      isPublic: true,
      founderPostcode:
        c.founder.businesses?.[0]?.location?.postcode ||
        c.founder.shippingAddresses?.find((a) => a.isMain)?.postalCode ||
        c.founder.shippingAddresses?.[0]?.postalCode,
    }));

    if (postcode) {
      const userCoords = await this.geolocationService.getCoordinates(postcode);
      if (userCoords) {
        // Collect unique founder postcodes
        const founderPostcodes = mappedCircles
          .map((c) => c.founderPostcode)
          .filter(Boolean);
        const coordMap =
          await this.geolocationService.getBulkCoordinates(founderPostcodes);

        // Calculate distance for each circle
        const circlesWithDistance = mappedCircles.map((circle) => {
          let distance = Infinity;
          let isExactPostcodeMatch = false;

          if (circle.founderPostcode) {
            // Clean postcodes for comparison (remove spaces, uppercase)
            const cleanUserPostcode = postcode
              .replace(/\s+/g, '')
              .toUpperCase();
            const cleanFounderPostcode = circle.founderPostcode
              .replace(/\s+/g, '')
              .toUpperCase();

            if (cleanUserPostcode === cleanFounderPostcode) {
              distance = 0;
              isExactPostcodeMatch = true;
            } else {
              const founderCoords = coordMap.get(circle.founderPostcode);
              if (founderCoords) {
                distance = this.geolocationService.calculateDistance(
                  userCoords.lat,
                  userCoords.lng,
                  founderCoords.lat,
                  founderCoords.lng,
                );
              }
            }
          }
          return { ...circle, distance, isExactPostcodeMatch };
        });

        // Sort: Exact postcode matches first, then by distance
        circlesWithDistance.sort((a, b) => {
          if (a.isExactPostcodeMatch && !b.isExactPostcodeMatch) return -1;
          if (!a.isExactPostcodeMatch && b.isExactPostcodeMatch) return 1;
          return a.distance - b.distance;
        });
        mappedCircles = circlesWithDistance;
      }
    }

    return {
      data: mappedCircles.slice(0, 10), // Return top 10 closest
      meta: {
        total: mappedCircles.length,
        page: 1,
        lastPage: 1,
      },
    };
  }

  async initiateContributionPayment(
    groupId: string,
    user: User,
    initiateDto: any,
  ): Promise<any> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });
    if (!group) throw new NotFoundException('Group not found');

    const groupMember = await this.groupMemberRepository.findOne({
      where: { groupId, userId: user.id },
    });

    if (!groupMember) {
      throw new NotFoundException('You are not a member of this group.');
    }

    // Allow multiple payments for Smart Money circles
    if (
      groupMember.status === GroupMemberStatus.ACTIVE &&
      group.type !== 'SMART_MONEY'
    ) {
      throw new ConflictException('You have already paid your contribution.');
    }

    const amount = initiateDto.amount || Number(group.contributionAmount);
    const currency = 'GBP';

    if (initiateDto.provider === 'STRIPE') {
      const paymentIntent =
        await this.paymentProviderService.createStripePaymentIntent(
          amount,
          currency,
        );
      return {
        clientSecret: paymentIntent.client_secret,
        provider: 'STRIPE',
      };
    } else if (initiateDto.provider === 'PAYPAL') {
      const order = await this.paymentProviderService.createPaypalOrder(
        amount,
        currency,
      );
      return { orderId: order.id, provider: 'PAYPAL' };
    } else {
      throw new BadRequestException('Invalid payment provider specified.');
    }
  }

  async verifyContributionPayment(
    groupId: string,
    user: User,
    verifyDto: any,
  ): Promise<any> {
    const { provider, transactionId, amount } = verifyDto;

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['wallet'],
    });
    if (!group) throw new NotFoundException('Group not found');

    const groupMember = await this.groupMemberRepository.findOne({
      where: { groupId, userId: user.id },
    });

    if (!groupMember) {
      throw new NotFoundException('You are not a member of this group.');
    }

    const currency = 'GBP';
    let verificationResult;

    if (provider === 'STRIPE') {
      verificationResult =
        await this.paymentProviderService.verifyStripePaymentIntent(
          transactionId,
          amount,
          currency,
        );
    } else if (provider === 'PAYPAL') {
      verificationResult =
        await this.paymentProviderService.captureAndVerifyPaypalOrder(
          transactionId,
          amount,
          currency,
        );
    } else {
      throw new BadRequestException('Invalid payment provider specified.');
    }

    if (!verificationResult.ok) {
      throw new BadRequestException(
        `Payment verification failed: ${verificationResult.reason}`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const memberToUpdate = await manager.findOne(GroupMember, {
        where: { groupId, userId: user.id },
        relations: ['group'],
        lock: { mode: 'pessimistic_write' },
      });

      const groupWallet = await manager.findOne(GroupWallet, {
        where: { group: { id: groupId } },
        lock: { mode: 'pessimistic_write' },
      });

      if (!groupWallet) {
        throw new InternalServerErrorException('Group wallet not found.');
      }

      groupWallet.balance = Number(groupWallet.balance) + Number(amount);
      memberToUpdate.status = GroupMemberStatus.ACTIVE;

      const updatedGroupWallet = await manager.save(GroupWallet, groupWallet);
      const updatedMember = await manager.save(GroupMember, memberToUpdate);

      const transaction = manager.create(GroupTransaction, {
        amount: amount,
        user,
        group: memberToUpdate.group,
        groupWallet: updatedGroupWallet,
      });
      await manager.save(GroupTransaction, transaction);

      // Process Cashback
      if (user.email) {
        try {
          await this.centralIntegrationService.processCashback(
            user.email,
            amount,
            CashbackEvent.GROUP_CONTRIBUTION_PAYMENT,
            transactionId,
          );
        } catch (error) {
          this.logger.error(
            `Failed to process cashback for group circle ${transactionId}: ${error.message}`,
          );
        }
      }

      return updatedMember;
    });
  }

  async delete(groupId: string, user: User): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found.');
    }

    if (group.founderId !== user.id) {
      throw new ForbiddenException('You are not the founder of this group.');
    }

    await this.groupRepository.softDelete(groupId);
  }
}
