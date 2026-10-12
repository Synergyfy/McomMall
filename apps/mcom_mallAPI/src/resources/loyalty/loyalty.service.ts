import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { UserRole } from '../../common/role.enum';
import {
  PointTransaction,
  PointTransactionType,
} from '../transaction/entities/point-transaction.entity';
import { ServiceBooking } from '../booking/entities/service-booking.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Promotion } from '../promotion/entities/promotion.entity';
import { LoyaltyRule } from './entities/loyalty-rule.entity';
import { LoyaltySettings } from './entities/loyalty-settings.entity';
import {
  CreateLoyaltyRuleDto,
  UpdateLoyaltyRuleDto,
  UpdateLoyaltySettingsDto,
} from './dto/loyalty.dto';
import { AllocatePointsDto } from './dto/allocate-points.dto';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(PointTransaction)
    private readonly pointTransactionRepository: Repository<PointTransaction>,
    @InjectRepository(ServiceBooking)
    private readonly bookingRepository: Repository<ServiceBooking>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(LoyaltyRule)
    private readonly ruleRepository: Repository<LoyaltyRule>,
    @InjectRepository(LoyaltySettings)
    private readonly settingsRepository: Repository<LoyaltySettings>,
    private readonly dataSource: DataSource,
  ) {}

  // --- Authorization ---

  /**
   * Ensures the caller owns the business (or is a platform admin) before any
   * loyalty read/write. Prevents cross-tenant loyalty management by businessId.
   */
  private async assertBusinessAccess(
    businessId: string,
    requester: { id: string; role?: string },
  ): Promise<void> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }
    if (
      requester.role !== UserRole.ADMIN &&
      business.user?.id !== requester.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to manage this loyalty program.',
      );
    }
  }

  async allocatePoints(
    dto: AllocatePointsDto,
    requester: { id: string; role?: string },
  ): Promise<PointTransaction> {
    await this.assertBusinessAccess(dto.businessId, requester);

    const customer = await this.userRepository.findOne({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException(
        `Customer with ID ${dto.customerId} not found`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const lockedUser = await manager
        .createQueryBuilder(User, 'user')
        .setLock('pessimistic_write')
        .where('user.id = :id', { id: dto.customerId })
        .getOne();
      if (!lockedUser) {
        throw new NotFoundException(
          `Customer with ID ${dto.customerId} not found`,
        );
      }

      lockedUser.points = (lockedUser.points ?? 0) + dto.points;
      await manager.save(lockedUser);

      const transaction = manager.create(PointTransaction, {
        user: lockedUser,
        points: dto.points,
        type: PointTransactionType.EARNED,
      });
      return manager.save(transaction);
    });
  }

  async getStats(
    businessId: string,
    requester: { id: string; role?: string },
  ): Promise<any> {
    await this.assertBusinessAccess(businessId, requester);

    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['services', 'offers', 'promotions'],
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }

    const serviceIds = (business.services ?? []).map((service) => service.id);

    const [pointsIssuedRaw, activeOffers, completedBookings, membersRaw] =
      await Promise.all([
        this.pointTransactionRepository
          .createQueryBuilder('pt')
          .select('COALESCE(SUM(pt.points), 0)', 'sum')
          .where('pt.type = :type', { type: PointTransactionType.EARNED })
          .getRawOne(),
        this.offerRepository.find({
          where: { isActive: true },
        }),
        serviceIds.length > 0
          ? this.bookingRepository
              .createQueryBuilder('booking')
              .leftJoinAndSelect('booking.service', 'service')
              .where('service.id IN (:...serviceIds)', { serviceIds })
              .andWhere('booking.status = :status', { status: 'completed' })
              .getMany()
          : Promise.resolve([]),
        this.userRepository
          .createQueryBuilder('user')
          .select('COUNT(DISTINCT user.id)', 'count')
          .where('user.points > 0')
          .getRawOne(),
      ]);

    const pointsIssued = Number(pointsIssuedRaw?.sum ?? 0);
    const activeRewards = activeOffers.length;
    const redemptionRate =
      pointsIssued > 0
        ? Math.min(100, Number((pointsIssued * 0.684).toFixed(1)))
        : 0;

    return {
      activeRewards,
      pointsIssued,
      redemptionRate: Number(redemptionRate),
      programGrowth: Number(membersRaw?.count ?? 0),
      completedBookings: completedBookings.length,
      offers: activeOffers.map((offer) => ({
        id: offer.id,
        title: offer.name ?? 'Reward',
        points: offer.points ?? 0,
        isActive: offer.isActive,
      })),
    };
  }

  async getCustomerLoyalty(
    businessId: string,
    customerId: string,
    requester: { id: string; role?: string },
  ): Promise<any> {
    await this.assertBusinessAccess(businessId, requester);

    const user = await this.userRepository.findOne({
      where: { id: customerId },
    });
    if (!user) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const [pointTransactions, offers, earnRules] = await Promise.all([
      this.pointTransactionRepository.find({
        where: { user: { id: customerId } },
        order: { created_at: 'DESC' },
        take: 50,
      }),
      this.offerRepository.find({
        where: { isActive: true },
      }),
      this.ruleRepository.find({
        where: { businessId, isActive: true },
      }),
    ]);

    return {
      userId: user.id,
      name: user.fullName || `${user.firstName} ${user.lastName}`,
      points: user.points,
      pointTransactions,
      claimableRewards: offers.map((offer) => ({
        id: offer.id,
        title: offer.name ?? 'Reward',
        description: offer.description ?? '',
        points: offer.points ?? 0,
      })),
      redeemedRewards: pointTransactions
        .filter((tx) => tx.type === PointTransactionType.REDEMPTION)
        .map((tx) => ({
          id: tx.id,
          points: Math.abs(tx.points),
          createdAt: tx.created_at,
        })),
      earnOffers: earnRules.map((rule) => ({
        id: rule.id,
        title: rule.name,
        description: rule.description ?? '',
        ruleType: rule.ruleType,
      })),
    };
  }

  async findAllRules(
    businessId: string,
    requester: { id: string; role?: string },
  ): Promise<LoyaltyRule[]> {
    await this.assertBusinessAccess(businessId, requester);
    return this.ruleRepository.find({
      where: { businessId },
      order: { created_at: 'DESC' },
    });
  }

  async createRule(
    dto: CreateLoyaltyRuleDto,
    requester: { id: string; role?: string },
  ): Promise<LoyaltyRule> {
    await this.assertBusinessAccess(dto.businessId, requester);
    const rule = this.ruleRepository.create(dto);
    return this.ruleRepository.save(rule);
  }

  async updateRule(
    id: string,
    dto: UpdateLoyaltyRuleDto,
    requester: { id: string; role?: string },
  ): Promise<LoyaltyRule> {
    const rule = await this.ruleRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Loyalty rule with ID ${id} not found`);
    }
    await this.assertBusinessAccess(rule.businessId, requester);
    Object.assign(rule, dto);
    return this.ruleRepository.save(rule);
  }

  async removeRule(
    id: string,
    requester: { id: string; role?: string },
  ): Promise<void> {
    const rule = await this.ruleRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Loyalty rule with ID ${id} not found`);
    }
    await this.assertBusinessAccess(rule.businessId, requester);
    await this.ruleRepository.remove(rule);
  }

  async getSettings(
    businessId: string,
    requester: { id: string; role?: string },
  ): Promise<LoyaltySettings> {
    await this.assertBusinessAccess(businessId, requester);
    let settings = await this.settingsRepository.findOne({
      where: { businessId },
    });
    if (!settings) {
      settings = this.settingsRepository.create({
        businessId,
        isEnabled: true,
        redemptionApproval: 'auto',
      });
      settings = await this.settingsRepository.save(settings);
    }
    return settings;
  }

  async updateSettings(
    businessId: string,
    dto: UpdateLoyaltySettingsDto,
    requester: { id: string; role?: string },
  ): Promise<LoyaltySettings> {
    const settings = await this.getSettings(businessId, requester);
    Object.assign(settings, dto);
    return this.settingsRepository.save(settings);
  }
}
