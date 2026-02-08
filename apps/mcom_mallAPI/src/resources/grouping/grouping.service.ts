import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupMemberStatus } from './group-member-status.enum';
import { GroupWallet } from './entities/group-wallet.entity';
import { GroupStatus } from './group-status.enum';
import { GroupTransaction } from './entities/group-transaction.entity';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { CashbackEvent } from '../../common/enums/cashback-event.enum';
import { InitiateContributionPaymentDto } from './dto/initiate-contribution-payment.dto';
import { VerifyContributionPaymentDto } from './dto/verify-contribution-payment.dto';
import { PaymentMethod } from '../order/entities/order-payment.entity';
import { GroupResponseDto } from './dto/group-response.dto';
import { CapabilityService, ActionType } from '../capability/capability.service';

const CONTRIBUTION_AMOUNT = 250;
const ACTIVATION_BALANCE = 3000;

@Injectable()
export class GroupingService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(GroupTransaction)
    private readonly groupTransactionRepository: Repository<GroupTransaction>,
    private readonly dataSource: DataSource,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly centralIntegrationService: CentralIntegrationService,
    private readonly capabilityService: CapabilityService,
  ) {}

  async create(createGroupDto: CreateGroupDto, founder: User): Promise<Group> {
    return this.dataSource.transaction(async (manager) => {
      // Use capability service to check permission
      // We need to check outside transaction or inside?
      // Check permission first.
      await this.capabilityService.checkPermission(founder.id, ActionType.CREATE_GROUP);

      const userWithMembership = await manager.findOne(User, {
        where: { id: founder.id },
        relations: ['membership'],
      });

      const group = this.groupRepository.create({
        ...createGroupDto,
        founder: userWithMembership,
        recruitmentDeadline: new Date(createGroupDto.recruitmentDeadline),
      });
      const savedGroup = await manager.save(group);


      const groupWallet = manager.create(GroupWallet, {
        group: savedGroup,
        balance: 0,
      });
      await manager.save(groupWallet);

      const founderMember = manager.create(GroupMember, {
        group: savedGroup,
        user: userWithMembership,
        status: GroupMemberStatus.PENDING_PAYMENT,
      });
      await manager.save(founderMember);

      savedGroup.members = [founderMember];
      return savedGroup;
    });
  }

  async joinGroup(groupId: string, user: User): Promise<GroupMember> {
    return this.dataSource.transaction(async (manager) => {
      const group = await manager.findOne(Group, {
        where: { id: groupId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!group) {
        throw new NotFoundException('Group not found.');
      }
      if (group.status !== GroupStatus.RECRUITING) {
        throw new ForbiddenException('This group is no longer recruiting.');
      }

      const memberCount = await manager.count(GroupMember, {
        where: { groupId: group.id },
      });
      if (memberCount >= group.size) {
        throw new ForbiddenException('This group is already full.');
      }

      const isAlreadyMember = await manager.exists(GroupMember, {
        where: { groupId: group.id, userId: user.id },
      });
      if (isAlreadyMember) {
        throw new ConflictException('User is already a member of this group.');
      }

      const newMember = this.groupMemberRepository.create({
        group,
        user,
        status: GroupMemberStatus.PENDING_PAYMENT,
      });
      return manager.save(GroupMember, newMember);
    });
  }

  async findAll(currentUser: User): Promise<GroupResponseDto[]> {
    // Get groups where the user is a member
    const memberOfGroups = await this.groupMemberRepository.find({
      where: { userId: currentUser.id },
      relations: ['group'],
    });
    const memberGroups = memberOfGroups.map((gm) => gm.group);

    // Get groups where the user is the founder
    const foundedGroups = await this.groupRepository.find({
      where: { founderId: currentUser.id },
    });

    // Combine and deduplicate
    const allGroupsMap = new Map<string, Group>();
    [...memberGroups, ...foundedGroups].forEach((group) => {
      if (group) {
        allGroupsMap.set(group.id, group);
      }
    });

    const uniqueGroups = Array.from(allGroupsMap.values());

    if (uniqueGroups.length === 0) {
      return [];
    }

    const groupIds = uniqueGroups.map((group) => group.id);

    const memberCounts = await this.groupMemberRepository
      .createQueryBuilder('groupMember')
      .select('groupMember.groupId', 'groupId')
      .addSelect('COUNT(groupMember.id)', 'count')
      .where('groupMember.groupId IN (:...groupIds)', { groupIds })
      .groupBy('groupMember.groupId')
      .getRawMany();

    const memberCountMap = new Map<string, number>();
    memberCounts.forEach((mc) => {
      memberCountMap.set(mc.groupId, parseInt(mc.count, 10));
    });

    return uniqueGroups.map((group) => ({
      ...group,
      isOwner: group.founderId === currentUser.id,
      memberCount: memberCountMap.get(group.id) || 0,
    }));
  }

  async findOne(groupId: string, currentUser: User): Promise<GroupResponseDto> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members', 'wallet', 'members.user'],
    });

    if (!group) {
      throw new NotFoundException('Group not found.');
    }

    return {
      ...group,
      isOwner: group.founderId === currentUser.id,
      memberCount: group.members.length,
    };
  }

  async initiateContributionPayment(
    groupId: string,
    user: User,
    initiateDto: InitiateContributionPaymentDto,
  ): Promise<{ clientSecret?: string; orderId?: string; provider: PaymentMethod }> {
    const groupMember = await this.groupMemberRepository.findOne({
      where: { groupId, userId: user.id },
    });

    if (!groupMember) {
      throw new NotFoundException('You are not a member of this group.');
    }
    if (groupMember.status === GroupMemberStatus.ACTIVE) {
      throw new ConflictException('You have already paid your contribution.');
    }

    const amount = CONTRIBUTION_AMOUNT;
    const currency = 'GBP';

    if (initiateDto.paymentProvider === PaymentMethod.STRIPE) {
      const paymentIntent =
        await this.paymentProviderService.createStripePaymentIntent(
          amount,
          currency,
        );
      return {
        clientSecret: paymentIntent.client_secret,
        provider: PaymentMethod.STRIPE,
      };
    } else if (initiateDto.paymentProvider === PaymentMethod.PAYPAL) {
      const order = await this.paymentProviderService.createPaypalOrder(
        amount,
        currency,
      );
      return { orderId: order.id, provider: PaymentMethod.PAYPAL };
    } else {
      throw new BadRequestException('Invalid payment provider specified.');
    }
  }

  async verifyContributionPayment(
    groupId: string,
    user: User,
    verifyDto: VerifyContributionPaymentDto,
  ): Promise<GroupMember> {
    const { paymentProvider, transactionId } = verifyDto;

    const groupMember = await this.groupMemberRepository.findOne({
      where: { groupId, userId: user.id },
    });

    if (!groupMember) {
      throw new NotFoundException('You are not a member of this group.');
    }
    if (groupMember.status === GroupMemberStatus.ACTIVE) {
      throw new ConflictException('You have already paid your contribution.');
    }

    const amount = CONTRIBUTION_AMOUNT;
    const currency = 'GBP';
    let verificationResult;

    if (paymentProvider === PaymentMethod.STRIPE) {
      verificationResult =
        await this.paymentProviderService.verifyStripePaymentIntent(
          transactionId,
          amount,
          currency,
        );
    } else if (paymentProvider === PaymentMethod.PAYPAL) {
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

      groupWallet.balance += CONTRIBUTION_AMOUNT;
      memberToUpdate.status = GroupMemberStatus.ACTIVE;

      const updatedGroupWallet = await manager.save(GroupWallet, groupWallet);
      const updatedMember = await manager.save(GroupMember, memberToUpdate);

      const transaction = manager.create(GroupTransaction, {
        amount: CONTRIBUTION_AMOUNT,
        user,
        group: memberToUpdate.group,
        groupWallet: updatedGroupWallet,
      });
      await manager.save(GroupTransaction, transaction);

      if (updatedGroupWallet.balance >= ACTIVATION_BALANCE) {
        await manager.update(
          Group,
          { id: groupId },
          { status: GroupStatus.ACTIVE },
        );
      }

      // Process Cashback
      if (user.email) {
        await this.centralIntegrationService.processCashback(
          user.email,
          CONTRIBUTION_AMOUNT,
          CashbackEvent.GROUP_CONTRIBUTION_PAYMENT,
          transactionId,
        );
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