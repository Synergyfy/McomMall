import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository, Not } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { BusinessStatus } from '../listings/listing.enum';
import { Review } from '../reviews/entities/review.entity';
import { Event } from '../events/entities/event.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Promotion } from '../promotion/entities/promotion.entity';
import { Campaign } from '../campaign/entities/campaign.entity';
import { InterestSignal } from '../interest-signals/entities/interest-signal.entity';
import {
  PointTransaction,
  PointTransactionType,
} from '../transaction/entities/point-transaction.entity';
import { Reward } from './entities/reward.entity';
import { RewardRedemption } from './entities/reward-redemption.entity';
import { DailySpinLedger } from './entities/daily-spin-ledger.entity';
import { ScratchCardLedger } from './entities/scratch-card-ledger.entity';
import { Challenge } from './entities/challenge.entity';
import { ChallengeProgress } from './entities/challenge-progress.entity';
import { EventRsvp, EventRsvpStatus } from './entities/event-rsvp.entity';
import {
  RedeemRewardDto,
  RedeemCodeDto,
  ListCustomerPromotionsQueryDto,
  CustomerPromotionFilter,
} from './dto/customer.dto';
import {
  RewardRedemptionStatus,
  SpinPrizeType,
  ScratchPrizeType,
} from './reward.enum';
import {
  CustomerHomeResponseDto,
  PromotionItemResponseDto,
  CustomerRewardsResponseDto,
  RedeemRewardResponseDto,
  RedeemCodeResponseDto,
  CustomerEventsResponseDto,
  RsvpEventResponseDto,
  GamifyStatusResponseDto,
  SpinResultDto,
  ScratchResultDto,
  ChallengeResponseDto,
  UpdateChallengeProgressResponseDto,
  DiscoverResponseDto,
  CustomerBusinessProfileResponseDto,
} from './dto/customer-response.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(InterestSignal)
    private readonly interestSignalRepository: Repository<InterestSignal>,
    @InjectRepository(PointTransaction)
    private readonly pointTransactionRepository: Repository<PointTransaction>,
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(RewardRedemption)
    private readonly redemptionRepository: Repository<RewardRedemption>,
    @InjectRepository(DailySpinLedger)
    private readonly spinLedgerRepository: Repository<DailySpinLedger>,
    @InjectRepository(ScratchCardLedger)
    private readonly scratchLedgerRepository: Repository<ScratchCardLedger>,
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
    @InjectRepository(ChallengeProgress)
    private readonly challengeProgressRepository: Repository<ChallengeProgress>,
    @InjectRepository(EventRsvp)
    private readonly eventRsvpRepository: Repository<EventRsvp>,
    private readonly dataSource: DataSource,
  ) {}

  private async getUserOrThrow(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  private async awardPoints(
    userId: string,
    points: number,
    type: PointTransactionType,
    manager?: EntityManager,
  ): Promise<void> {
    const exec = async (execManager: EntityManager): Promise<void> => {
      const lockedUser = await execManager
        .createQueryBuilder(User, 'user')
        .setLock('pessimistic_write')
        .where('user.id = :id', { id: userId })
        .getOne();
      if (!lockedUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      lockedUser.points = (lockedUser.points ?? 0) + points;
      await execManager.save(lockedUser);

      const tx = execManager.create(PointTransaction, {
        user: lockedUser,
        points,
        type,
      });
      await execManager.save(tx);
    };

    if (manager) {
      await exec(manager);
      return;
    }
    await this.dataSource.transaction((txManager) => exec(txManager));
  }

  async getHome(userId: string): Promise<CustomerHomeResponseDto> {
    const user = await this.getUserOrThrow(userId);

    const now = new Date();

    const [
      activeOffers,
      activeCampaigns,
      trendingBusinesses,
      pointsAggregate,
      recentActivity,
    ] = await Promise.all([
      this.offerRepository.find({
        where: { isActive: true },
        relations: ['businesses'],
        take: 50,
      }),
      this.campaignRepository.find({
        relations: ['business'],
        take: 50,
      }),
      this.businessRepository
        .createQueryBuilder('business')
        .leftJoinAndSelect('business.category', 'category')
        .where('business.isVerified = :verified', { verified: true })
        .andWhere('business.status != :status', { status: 'draft' })
        .orderBy('business.reviewCount', 'DESC')
        .take(8)
        .getMany(),
      this.pointTransactionRepository
        .createQueryBuilder('pt')
        .select(
          `COALESCE(SUM(CASE WHEN pt.points > 0 THEN pt.points ELSE 0 END), 0)`,
          'earned',
        )
        .addSelect(
          `COALESCE(SUM(CASE WHEN pt.points < 0 THEN ABS(pt.points) ELSE 0 END), 0)`,
          'used',
        )
        .where('pt.userId = :userId', { userId })
        .getRawOne<{ earned: string; used: string }>(),
      this.businessRepository
        .createQueryBuilder('business')
        .leftJoinAndSelect('business.reviews', 'review')
        .leftJoinAndSelect('review.user', 'reviewUser')
        .where('review.status = :published', { published: 'published' })
        .orderBy('review.created_at', 'DESC')
        .take(6)
        .getMany(),
    ]);

    const activeCampaignsCount = activeCampaigns.filter((campaign) => {
      if (!campaign.startDate) {
        return false;
      }
      const start = new Date(campaign.startDate);
      const end = campaign.endDate ? new Date(campaign.endDate) : null;
      return start <= now && (!end || end >= now);
    }).length;

    const pointsBreakdown = {
      earned: Number(pointsAggregate?.earned ?? 0),
      used: Number(pointsAggregate?.used ?? 0),
      pending: 0,
    };

    return {
      user: {
        id: user.id,
        name: user.fullName || `${user.firstName} ${user.lastName}`,
        points: user.points,
      },
      pointsBreakdown,
      liveOffersCount: activeOffers.length,
      activeCampaignsCount,
      trending: trendingBusinesses.map((b) => ({
        id: b.id,
        businessName: b.businessName,
        category: b.category ? b.category.name : 'Store',
        rating: b.averageRating,
        reviewCount: b.reviewCount,
        logoUrl: b.logoUrl,
        bannerUrl: b.bannerUrl,
        shortDescription: b.shortDescription,
        distance: null,
        tag: 'Trending',
      })),
      recentActivity: recentActivity.map((b) => ({
        businessId: b.id,
        businessName: b.businessName,
        reviews: (b.reviews ?? []).slice(0, 2).map((review) => ({
          id: review.id,
          author: review.user ? review.user.fullName : 'Customer',
          rating: review.rating,
          comment: review.comment,
        })),
      })),
      nearbyDeals: activeOffers.map((offer) => ({
        id: offer.id,
        name: offer.name,
        description: offer.description ?? '',
        points: offer.points ?? 0,
        businesses: (offer.businesses ?? []).map((b) => b.businessName),
      })),
    };
  }

  async getPromotions(
    query: ListCustomerPromotionsQueryDto,
  ): Promise<PromotionItemResponseDto[]> {
    const now = new Date();

    const [offers, promotions, campaigns] = await Promise.all([
      this.offerRepository.find({
        where: { isActive: true },
        relations: ['businesses', 'businesses.location'],
        take: 100,
      }),
      this.promotionRepository.find({
        where: { isActive: true },
        relations: ['businesses', 'businesses.location'],
        take: 100,
      }),
      this.campaignRepository.find({
        relations: ['business', 'business.location'],
        take: 100,
      }),
    ]);

    const items: PromotionItemResponseDto[] = [];

    for (const offer of offers) {
      const business = (offer.businesses ?? [])[0];
      items.push({
        id: offer.id,
        title: offer.name,
        businessName: business ? business.businessName : 'MCOM Partner',
        benefitValue: offer.discountPercentage
          ? `${offer.discountPercentage}% OFF`
          : offer.discountAmount
            ? `${offer.discountAmount} OFF`
            : `${offer.points} PTS`,
        description: offer.description ?? '',
        longDescription: offer.description ?? '',
        borough: business?.location?.resolvedArea ?? null,
        expiresAt: offer.endDate,
        expiryText: offer.endDate
          ? this.formatExpiry(offer.endDate, now)
          : 'Limited time',
        promotionType: 'daily',
        image: business?.bannerUrl ?? null,
        isActive: offer.isActive,
      });
    }

    for (const promotion of promotions) {
      const business = (promotion.businesses ?? [])[0];
      items.push({
        id: promotion.id,
        title: promotion.name,
        businessName: business ? business.businessName : 'MCOM Partner',
        benefitValue: promotion.bonusPoints
          ? `${promotion.bonusPoints} BONUS PTS`
          : promotion.multiplier
            ? `${promotion.multiplier}x POINTS`
            : 'DEAL',
        description: promotion.description ?? '',
        longDescription: promotion.description ?? '',
        borough: business?.location?.resolvedArea ?? null,
        expiresAt: promotion.endDate,
        expiryText: promotion.endDate
          ? this.formatExpiry(promotion.endDate, now)
          : 'Limited time',
        promotionType: 'flash',
        image: business?.bannerUrl ?? null,
        isActive: promotion.isActive,
      });
    }

    for (const campaign of campaigns) {
      items.push({
        id: campaign.id,
        title: `${campaign.business?.businessName ?? 'Campaign'} ${campaign.type.replace(/_/g, ' ')}`,
        businessName: campaign.business?.businessName ?? 'MCOM Partner',
        benefitValue: 'CAMPAIGN',
        description: 'Active neighbourhood campaign',
        longDescription: 'Active neighbourhood campaign',
        borough: campaign.displayOnlyIfRegion ?? null,
        expiresAt: campaign.endDate,
        expiryText: campaign.endDate
          ? this.formatExpiry(campaign.endDate, now)
          : 'Limited time',
        promotionType: 'borough',
        image: campaign.business?.bannerUrl ?? null,
        isActive: true,
      });
    }

    const filtered = items.filter((item) => {
      if (!query.type || query.type === CustomerPromotionFilter.ALL) {
        return true;
      }
      if (query.type === CustomerPromotionFilter.FLASH) {
        return item.promotionType === 'flash';
      }
      if (query.type === CustomerPromotionFilter.BOROUGH) {
        return (
          item.promotionType === 'borough' &&
          (!query.borough || item.borough === query.borough)
        );
      }
      if (query.type === CustomerPromotionFilter.EXPIRING) {
        return (
          item.expiresAt &&
          new Date(item.expiresAt).getTime() - now.getTime() < 24 * 3600 * 1000
        );
      }
      if (query.type === CustomerPromotionFilter.NEARBY) {
        if (!query.lat || !query.lng || !item.expiresAt) {
          return true;
        }
        const itemBorough = item.borough;
        return !query.borough || itemBorough === query.borough;
      }
      if (query.type === CustomerPromotionFilter.SAVED) {
        return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      const aExp = a.expiresAt
        ? new Date(a.expiresAt).getTime()
        : Number.MAX_SAFE_INTEGER;
      const bExp = b.expiresAt
        ? new Date(b.expiresAt).getTime()
        : Number.MAX_SAFE_INTEGER;
      return aExp - bExp;
    });
  }

  async getRewards(userId: string): Promise<CustomerRewardsResponseDto> {
    const user = await this.getUserOrThrow(userId);

    const [rewards, redemptions, pointTx] = await Promise.all([
      this.rewardRepository.find({
        where: { isActive: true },
        order: { cost: 'ASC' },
      }),
      this.redemptionRepository.find({
        where: { userId },
        relations: ['reward'],
        order: { created_at: 'DESC' },
      }),
      this.pointTransactionRepository.find({
        where: { user: { id: userId } },
        order: { created_at: 'DESC' },
        take: 50,
      }),
    ]);

    const unavailableIds = new Set(redemptions.map((r) => r.rewardId));

    const available = rewards.filter(
      (reward) => !unavailableIds.has(reward.id),
    );

    const pointsAggregate = {
      earned: pointTx
        .filter((tx) => tx.points > 0)
        .reduce((s, tx) => s + tx.points, 0),
      used: pointTx
        .filter((tx) => tx.points < 0)
        .reduce((s, tx) => s + Math.abs(tx.points), 0),
      pending: 0,
    };

    return {
      pointsBalance: user.points,
      pointsBreakdown: pointsAggregate,
      rewards: available.map((reward) => ({
        id: reward.id,
        title: reward.title,
        brand: reward.brand,
        category: reward.category,
        cost: reward.cost,
        description: reward.description ?? '',
        longDescription: reward.longDescription ?? '',
        image: reward.image ?? '',
        badgeIcon: reward.badgeIcon ?? '',
        rewardType: reward.rewardType,
        usageCondition: reward.usageCondition ?? '',
        isHot: reward.isHot,
        isLocked: reward.isLocked,
        pointsRequired: reward.pointsRequired ?? reward.cost,
        tier: reward.tier ?? null,
        expiresAt: reward.expiresAt,
        expiryText: reward.expiresAt
          ? this.formatExpiry(reward.expiresAt, new Date())
          : 'Available',
      })),
      redeemed: redemptions.map((redemption) => ({
        id: redemption.id,
        rewardId: redemption.rewardId,
        title: redemption.reward.title,
        brand: redemption.reward.brand,
        cost: redemption.pointsSpent,
        status: redemption.status,
        redeemedAt: redemption.redeemedAt ?? redemption.created_at,
        issuedCode: redemption.issuedCode ?? null,
      })),
      expiring: rewards
        .filter((reward) => reward.expiresAt && !unavailableIds.has(reward.id))
        .sort(
          (a, b) =>
            new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
        )
        .slice(0, 5)
        .map((reward) => ({
          id: reward.id,
          title: reward.title,
          brand: reward.brand,
          cost: reward.cost,
          expiresAt: reward.expiresAt,
        })),
    };
  }

  async redeemReward(
    userId: string,
    dto: RedeemRewardDto,
  ): Promise<RedeemRewardResponseDto> {
    const reward = await this.rewardRepository.findOne({
      where: { id: dto.rewardId, isActive: true },
    });
    if (!reward) {
      throw new NotFoundException(`Reward with ID ${dto.rewardId} not found`);
    }
    if (reward.rewardType === 'code') {
      throw new BadRequestException(
        'Code rewards must be redeemed via the redeem-code endpoint',
      );
    }

    let issuedCode: string | undefined;

    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const redemptionRepo = manager.getRepository(RewardRedemption);

      const lockedUser = await userRepo
        .createQueryBuilder('user')
        .setLock('pessimistic_write')
        .where('user.id = :id', { id: userId })
        .getOne();
      if (!lockedUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const existing = await redemptionRepo.findOne({
        where: { userId, rewardId: reward.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (existing) {
        throw new BadRequestException('Reward already claimed by this user');
      }

      if ((lockedUser.points ?? 0) < reward.cost) {
        throw new BadRequestException(
          'Insufficient points to redeem this reward',
        );
      }

      lockedUser.points = (lockedUser.points ?? 0) - reward.cost;
      await userRepo.save(lockedUser);

      issuedCode = reward.code ?? undefined;

      const redemption = redemptionRepo.create({
        userId,
        rewardId: reward.id,
        pointsSpent: reward.cost,
        status: RewardRedemptionStatus.CLAIMED,
        issuedCode,
      });
      await redemptionRepo.save(redemption);

      const tx = manager.create(PointTransaction, {
        user: lockedUser,
        points: -reward.cost,
        type: PointTransactionType.REDEMPTION,
      });
      await manager.save(tx);
    });

    return {
      success: true,
      rewardId: reward.id,
      title: reward.title,
      cost: reward.cost,
      issuedCode,
      message: 'Reward claimed successfully',
    };
  }

  async redeemCode(
    userId: string,
    dto: RedeemCodeDto,
  ): Promise<RedeemCodeResponseDto> {
    const reward = await this.rewardRepository.findOne({
      where: { code: dto.code, isActive: true },
    });
    if (!reward || reward.rewardType !== 'code') {
      throw new NotFoundException(`Reward code "${dto.code}" is invalid`);
    }

    const pointsToAward = reward.pointsRequired ?? reward.cost;

    await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const redemptionRepo = manager.getRepository(RewardRedemption);

      const lockedUser = await userRepo
        .createQueryBuilder('user')
        .setLock('pessimistic_write')
        .where('user.id = :id', { id: userId })
        .getOne();
      if (!lockedUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const existing = await redemptionRepo.findOne({
        where: { userId, rewardId: reward.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (existing) {
        throw new BadRequestException(
          'This code has already been redeemed by your account',
        );
      }

      lockedUser.points = (lockedUser.points ?? 0) + pointsToAward;
      await userRepo.save(lockedUser);

      const redemption = redemptionRepo.create({
        userId,
        rewardId: reward.id,
        pointsSpent: 0,
        status: RewardRedemptionStatus.REDEEMED,
        redeemedAt: new Date(),
      });
      await redemptionRepo.save(redemption);

      const tx = manager.create(PointTransaction, {
        user: lockedUser,
        points: pointsToAward,
        type: PointTransactionType.EARNED,
      });
      await manager.save(tx);
    });

    return {
      success: true,
      code: dto.code,
      pointsAwarded: pointsToAward,
      message: `Code redeemed! ${pointsToAward} points added to your balance`,
    };
  }

  async getDiscover(): Promise<DiscoverResponseDto> {
    const now = new Date();

    const [trending, businesses, activeOffers, events, activeCampaigns] =
      await Promise.all([
        this.businessRepository
          .createQueryBuilder('business')
          .leftJoinAndSelect('business.category', 'category')
          .where('business.isVerified = :verified', { verified: true })
          .orderBy('business.reviewCount', 'DESC')
          .take(8)
          .getMany(),
        this.businessRepository.find({
          where: { status: Not(BusinessStatus.DRAFT) },
          relations: ['category'],
          take: 50,
        }),
        this.offerRepository.find({
          where: { isActive: true },
          relations: ['businesses'],
          take: 100,
        }),
        this.eventRepository.find({
          where: { status: 'upcoming' },
          order: { date: 'ASC' },
          take: 30,
        }),
        this.campaignRepository.find({
          relations: ['business'],
          take: 50,
        }),
      ]);

    const boroughCampaigns = activeCampaigns.filter((campaign) => {
      if (!campaign.startDate) {
        return false;
      }
      const start = new Date(campaign.startDate);
      const end = campaign.endDate ? new Date(campaign.endDate) : null;
      return start <= now && (!end || end >= now);
    });

    return {
      trending: trending.map((b) => ({
        id: b.id,
        businessName: b.businessName,
        category: b.category ? b.category.name : 'Store',
        rating: b.averageRating,
        reviewCount: b.reviewCount,
        bannerUrl: b.bannerUrl,
        shortDescription: b.shortDescription,
      })),
      boroughCampaigns: boroughCampaigns.map((campaign) => ({
        id: campaign.id,
        title: `${campaign.business?.businessName ?? 'Campaign'} ${campaign.type.replace(/_/g, ' ')}`,
        borough: campaign.displayOnlyIfRegion ?? null,
        budget: campaign.budget,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
      })),
      promotions: activeOffers.map((offer) => ({
        id: offer.id,
        name: offer.name,
        description: offer.description ?? '',
        points: offer.points ?? 0,
        businesses: (offer.businesses ?? []).map((b) => b.businessName),
      })),
      events: events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        endTime: null,
        location: event.location,
        borough: event.borough ?? null,
        category: event.venueType ?? 'in-person',
        capacity: event.capacity,
        attendees: 0,
        image: event.imageUrl ?? null,
        businessName: null,
        status: event.status,
      })),
      businesses: businesses.map((b) => ({
        id: b.id,
        businessName: b.businessName,
        category: b.category ? b.category.name : 'Store',
        rating: b.averageRating,
        reviewCount: b.reviewCount,
        bannerUrl: b.bannerUrl,
        shortDescription: b.shortDescription,
        statusTag: b.isVerified ? 'VERIFIED' : 'LISTED',
      })),
    };
  }

  async getBusinessProfile(
    businessId: string,
  ): Promise<CustomerBusinessProfileResponseDto> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['category', 'reviews', 'reviews.user', 'offers', 'events'],
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }

    const reviews = (business.reviews ?? [])
      .filter((review) => review.status === 'published')
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return {
      id: business.id,
      businessName: business.businessName,
      shortDescription: business.shortDescription,
      about: business.about ?? '',
      category: business.category ? business.category.name : 'Store',
      logoUrl: business.logoUrl ?? null,
      bannerUrl: business.bannerUrl ?? null,
      media: business.media ?? [],
      rating: business.averageRating,
      reviewCount: business.reviewCount,
      isVerified: business.isVerified,
      statusTag: business.isVerified ? 'VERIFIED' : 'LISTED',
      reviews: reviews.map((review) => ({
        id: review.id,
        author: review.user ? review.user.fullName : 'Customer',
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
      offers: (business.offers ?? [])
        .filter((offer) => offer.isActive)
        .map((offer) => ({
          id: offer.id,
          name: offer.name,
          description: offer.description ?? '',
          points: offer.points ?? 0,
        })),
      events: (business.events ?? []).map((event) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        status: event.status,
      })),
    };
  }

  async getEvents(): Promise<CustomerEventsResponseDto[]> {
    const events = await this.eventRepository.find({
      order: { date: 'ASC' },
      take: 50,
      relations: ['business'],
    });

    const eventIds = events
      .filter((event) => ['upcoming', 'active'].includes(event.status))
      .map((event) => event.id);

    let rsvpCounts = new Map<string, number>();
    if (eventIds.length > 0) {
      const counts = await this.eventRsvpRepository
        .createQueryBuilder('rsvp')
        .select('rsvp.eventId', 'eventId')
        .addSelect('COUNT(rsvp.id)', 'count')
        .where('rsvp.eventId IN (:...eventIds)', { eventIds })
        .groupBy('rsvp.eventId')
        .getRawMany<{ eventId: string; count: string }>();
      rsvpCounts = new Map(counts.map((c) => [c.eventId, Number(c.count)]));
    }

    return events
      .filter((event) => ['upcoming', 'active'].includes(event.status))
      .map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        endTime: null,
        location: event.location,
        borough: event.borough ?? null,
        category: event.venueType ?? 'in-person',
        capacity: event.capacity,
        attendees: rsvpCounts.get(event.id) ?? 0,
        image: event.imageUrl ?? null,
        businessName: event.business?.businessName ?? null,
        status: event.status,
      }));
  }

  async rsvpEvent(
    userId: string,
    eventId: string,
  ): Promise<RsvpEventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    if (!['upcoming', 'active'].includes(event.status)) {
      throw new BadRequestException(
        `Event with ID ${eventId} is not open for RSVP (status: ${event.status})`,
      );
    }

    await this.dataSource.transaction(async (manager) => {
      const rsvpRepo = manager.getRepository(EventRsvp);

      const existing = await rsvpRepo.findOne({
        where: { userId, eventId },
        lock: { mode: 'pessimistic_write' },
      });
      if (existing) {
        throw new BadRequestException('You have already RSVPed to this event');
      }

      const rsvp = rsvpRepo.create({
        userId,
        eventId,
        status: EventRsvpStatus.CONFIRMED,
      });
      await rsvpRepo.save(rsvp);
    });

    return { success: true, eventId: event.id, message: 'RSVP recorded' };
  }

  async getGamifyStatus(userId: string): Promise<GamifyStatusResponseDto> {
    const today = this.todayDate();
    const [spin, scratch, challenges, progress] = await Promise.all([
      this.spinLedgerRepository.findOne({
        where: { userId, spinDate: today },
      }),
      this.scratchLedgerRepository.findOne({
        where: { userId, scratchDate: today },
      }),
      this.challengeRepository.find({
        where: { isActive: true },
        order: { startDate: 'ASC' },
      }),
      this.challengeProgressRepository.find({
        where: { userId },
        relations: ['challenge'],
      }),
    ]);

    return {
      dailySpin: {
        available: !spin,
        lastPrize: spin
          ? {
              prizeType: spin.prizeType,
              prizeValue: spin.prizeValue,
              pointsAwarded: spin.pointsAwarded,
            }
          : null,
        streak: 0,
      },
      scratchCard: {
        available: !scratch,
        lastPrize: scratch
          ? {
              prizeType: scratch.prizeType,
              prizeValue: scratch.prizeValue,
              prizeLabel: scratch.prizeLabel,
            }
          : null,
      },
      challenges: challenges.map((challenge) => {
        const userProgress = progress.find(
          (p) => p.challengeId === challenge.id,
        );
        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description ?? '',
          challengeType: challenge.challengeType,
          target: Number(challenge.target),
          rewardPoints: challenge.rewardPoints,
          startDate: challenge.startDate,
          endDate: challenge.endDate,
          progress: userProgress ? Number(userProgress.progress) : 0,
          isCompleted: userProgress?.isCompleted ?? false,
        };
      }),
    };
  }

  async dailySpin(userId: string): Promise<SpinResultDto> {
    const today = this.todayDate();

    return this.dataSource.transaction(async (manager) => {
      const spinRepo = manager.getRepository(DailySpinLedger);

      const existing = await spinRepo.findOne({
        where: { userId, spinDate: today },
        lock: { mode: 'pessimistic_write' },
      });
      if (existing) {
        throw new BadRequestException('Daily spin already used today');
      }

      const roll = Math.random();
      let prizeType: SpinPrizeType;
      let prizeValue = 0;
      let pointsAwarded = 0;

      if (roll < 0.5) {
        prizeType = SpinPrizeType.POINTS;
        prizeValue = Math.floor(Math.random() * 50) + 10;
        pointsAwarded = prizeValue;
      } else if (roll < 0.85) {
        prizeType = SpinPrizeType.SURPRISE;
        pointsAwarded = 0;
      } else {
        prizeType = SpinPrizeType.VOUCHER;
        pointsAwarded = 0;
      }

      const ledger = spinRepo.create({
        userId,
        spinDate: today,
        prizeType,
        prizeValue,
        pointsAwarded,
      });
      await spinRepo.save(ledger);

      if (pointsAwarded > 0) {
        await this.awardPoints(
          userId,
          pointsAwarded,
          PointTransactionType.EARNED,
          manager,
        );
      }

      return {
        success: true,
        prizeType,
        prizeValue,
        pointsAwarded,
        message:
          pointsAwarded > 0
            ? `You won ${pointsAwarded} points!`
            : 'Better luck next time!',
      };
    });
  }

  async scratchCard(userId: string): Promise<ScratchResultDto> {
    const today = this.todayDate();

    return this.dataSource.transaction(async (manager) => {
      const scratchRepo = manager.getRepository(ScratchCardLedger);

      const existing = await scratchRepo.findOne({
        where: { userId, scratchDate: today },
        lock: { mode: 'pessimistic_write' },
      });
      if (existing) {
        throw new BadRequestException('Scratch card already used today');
      }

      const roll = Math.random();
      let prizeType: ScratchPrizeType;
      let prizeValue: number | undefined;
      let prizeLabel: string | undefined;

      if (roll < 0.4) {
        prizeType = ScratchPrizeType.POINTS;
        prizeValue = Math.floor(Math.random() * 30) + 5;
        prizeLabel = `${prizeValue} bonus points`;
      } else if (roll < 0.7) {
        prizeType = ScratchPrizeType.VOUCHER;
        prizeLabel = '5% off voucher';
      } else if (roll < 0.9) {
        prizeType = ScratchPrizeType.REWARD;
        prizeLabel = 'Free reward unlocked';
      } else {
        prizeType = ScratchPrizeType.NONE;
        prizeLabel = 'No win today';
      }

      const ledger = scratchRepo.create({
        userId,
        scratchDate: today,
        prizeType,
        prizeValue,
        prizeLabel,
      });
      await scratchRepo.save(ledger);

      if (prizeType === ScratchPrizeType.POINTS && prizeValue) {
        await this.awardPoints(
          userId,
          prizeValue,
          PointTransactionType.EARNED,
          manager,
        );
      }

      return {
        success: true,
        prizeType,
        prizeValue,
        prizeLabel,
      };
    });
  }

  async getChallenges(): Promise<ChallengeResponseDto[]> {
    const challenges = await this.challengeRepository.find({
      where: { isActive: true },
      order: { startDate: 'ASC' },
    });
    return challenges.map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description ?? '',
      challengeType: challenge.challengeType,
      target: Number(challenge.target),
      rewardPoints: challenge.rewardPoints,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
    }));
  }

  async updateChallengeProgress(
    userId: string,
    challengeId: string,
    progress: number,
  ): Promise<UpdateChallengeProgressResponseDto> {
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
    });
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${challengeId} not found`);
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const progressRepo = manager.getRepository(ChallengeProgress);

      let record = await progressRepo.findOne({
        where: { userId, challengeId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!record) {
        record = progressRepo.create({
          userId,
          challengeId,
          progress: 0,
          isCompleted: false,
        });
      }

      record.progress = Math.min(progress, Number(challenge.target));
      const reachedTarget =
        record.progress >= Number(challenge.target) && !record.isCompleted;

      if (reachedTarget) {
        record.isCompleted = true;
        record.completedAt = new Date();
      }
      await progressRepo.save(record);

      if (reachedTarget && challenge.rewardPoints > 0) {
        await this.awardPoints(
          userId,
          challenge.rewardPoints,
          PointTransactionType.EARNED,
          manager,
        );
      }

      return {
        challengeId,
        progress: Number(record.progress),
        target: Number(challenge.target),
        isCompleted: record.isCompleted,
      };
    });

    return result;
  }

  private todayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private formatExpiry(date: Date, now: Date): string {
    const diffMs = new Date(date).getTime() - now.getTime();
    if (diffMs <= 0) {
      return 'Expired';
    }
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) {
      return `Ends in ${diffMin}m`;
    }
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
      return `Ends in ${diffHours}h`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `Ends in ${diffDays}d`;
  }
}
