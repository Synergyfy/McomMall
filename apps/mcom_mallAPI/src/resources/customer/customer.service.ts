import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { BusinessStatus } from '../listings/listing.enum';
import { Review } from '../reviews/entities/review.entity';
import { Event } from '../events/entities/event.entity';
import { Offer } from '../offer/entities/offer.entity';
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
import { ApprovalStatus } from '../../common/moderation/catalog-approval';
import { MarketplaceLocationService } from '../geography/marketplace-location.service';
import {
  RedeemRewardDto,
  RedeemCodeDto,
} from './dto/customer.dto';
import {
  RewardRedemptionStatus,
  SpinPrizeType,
  ScratchPrizeType,
} from './reward.enum';
import {
  CustomerHomeResponseDto,
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
    private readonly marketplaceLocation: MarketplaceLocationService,
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

  /**
   * Customer dashboard feed.
   *
   * The shopper's borough comes from their MCOM Central profile via the
   * marketplace location resolver (Central assignment → profile postcode →
   * nearest city). When `borough` is supplied explicitly it overrides the
   * profile so the dashboard can preview another real borough, but every other
   * value is filtered to the same place.
   */
  async getHome(
    userId: string,
    borough?: string,
  ): Promise<CustomerHomeResponseDto> {
    const user = await this.getUserOrThrow(userId);
    const now = new Date();

    const resolvedLocation = await this.marketplaceLocation.resolve({ user });
    const centralProfile = (user.centralProfile || {}) as Record<
      string,
      unknown
    >;
    const profileBorough =
      (centralProfile.borough as string | undefined) ||
      ((centralProfile.localMall as Record<string, unknown> | undefined)
        ?.borough as string | undefined) ||
      null;
    const boroughName =
      borough?.trim() ||
      resolvedLocation.hierarchy.borough?.name ||
      resolvedLocation.hierarchy.city?.name ||
      profileBorough ||
      null;

    // Both the customer and every merchant provide a postcode during Central
    // onboarding. The assigned borough is the primary match; the outward code
    // catches merchants in the same area whose Central hierarchy has not been
    // backfilled yet. An explicit borough override disables the postcode match
    // so the preview only contains that borough.
    const customerPostcode =
      user.postcode ||
      ((user.centralProfile as Record<string, unknown> | null)?.postcode as
        | string
        | undefined) ||
      null;
    const compactPostcode = (customerPostcode || '')
      .toUpperCase()
      .replace(/\s+/g, '');
    const outcode =
      !borough && compactPostcode.length > 3
        ? compactPostcode.slice(0, compactPostcode.length - 3)
        : null;

    const applyLocationFilter = (
      qb: SelectQueryBuilder<any>,
      businessAlias: string,
      locationAlias: string,
      extraConditions: string[] = [],
    ) => {
      const conditions = [...extraConditions];
      const params: Record<string, string> = {};

      if (boroughName) {
        conditions.push(
          `LOWER(${businessAlias}.geoBoroughName) = LOWER(:boroughName)`,
          `LOWER(${locationAlias}.city) = LOWER(:boroughName)`,
          `LOWER(${locationAlias}.resolvedArea) = LOWER(:boroughName)`,
        );
        params.boroughName = boroughName;
      }
      if (outcode) {
        conditions.push(
          `REPLACE(UPPER(${locationAlias}.postcode), ' ', '') LIKE :outcodePrefix`,
        );
        params.outcodePrefix = `${outcode}%`;
      }
      if (conditions.length > 0) {
        qb.andWhere(`(${conditions.join(' OR ')})`, params);
      }
    };

    // ── Live offers from merchants in the shopper's borough ────────────────
    const offersQb = this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.user', 'offerUser')
      .leftJoinAndSelect('offerUser.businesses', 'offerBusiness')
      .leftJoinAndSelect('offerBusiness.location', 'offerLocation')
      .where('offer.isActive = :isActive', { isActive: true })
      .andWhere('offer.approvalStatus = :approvalStatus', {
        approvalStatus: ApprovalStatus.APPROVED,
      })
      .andWhere('offer.adminDisabled = false')
      .andWhere('offer.isTimeBonus = false')
      .andWhere('(offer.beginDate IS NULL OR offer.beginDate <= :now)', {
        now,
      })
      .andWhere('(offer.endDate IS NULL OR offer.endDate >= :now)', { now })
      .orderBy('offer.created_at', 'DESC')
      .take(50);
    applyLocationFilter(offersQb, 'offerBusiness', 'offerLocation');

    // ── Campaigns in the same borough ──────────────────────────────────────
    const campaignsQb = this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.business', 'campaignBusiness')
      .leftJoinAndSelect('campaignBusiness.location', 'campaignLocation')
      .where('campaign.startDate <= :now', { now })
      .andWhere('(campaign.endDate IS NULL OR campaign.endDate >= :now)', {
        now,
      })
      .take(50);
    applyLocationFilter(campaignsQb, 'campaignBusiness', 'campaignLocation');

    // ── Trending businesses near the shopper ───────────────────────────────
    const trendingQb = this.businessRepository
      .createQueryBuilder('business')
      .leftJoinAndSelect('business.category', 'category')
      .leftJoinAndSelect('business.location', 'location')
      .where('business.status = :status', {
        status: BusinessStatus.PUBLISHED,
      })
      .orderBy('business.isVerified', 'DESC')
      .addOrderBy('business.reviewCount', 'DESC')
      .take(8);
    applyLocationFilter(trendingQb, 'business', 'location');

    // ── Upcoming events in the same borough ───────────────────────────────
    const eventsQb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.business', 'eventBusiness')
      .leftJoinAndSelect('eventBusiness.location', 'eventLocation')
      .where('event.status != :cancelled', { cancelled: 'cancelled' })
      .andWhere('event.date >= :today', {
        today: now.toISOString().split('T')[0],
      })
      .orderBy('event.date', 'ASC')
      .take(6);
    applyLocationFilter(
      eventsQb,
      'eventBusiness',
      'eventLocation',
      boroughName ? ['LOWER(event.borough) = LOWER(:eventBorough)'] : [],
    );
    if (boroughName) {
      eventsQb.setParameter('eventBorough', boroughName);
    }

    // ── Recent reviews from businesses in the borough ─────────────────────
    const activityQb = this.businessRepository
      .createQueryBuilder('business')
      .leftJoinAndSelect('business.reviews', 'review')
      .leftJoinAndSelect('review.user', 'reviewUser')
      .leftJoinAndSelect('business.location', 'businessLocation')
      .where('review.status = :published', { published: 'published' })
      .orderBy('review.createdAt', 'DESC')
      .take(6);
    applyLocationFilter(activityQb, 'business', 'businessLocation');

    const [
      activeOffers,
      activeCampaigns,
      trendingBusinesses,
      pointsAggregate,
      recentActivity,
      upcomingEvents,
    ] = await Promise.all([
      offersQb.getMany(),
      campaignsQb.getMany(),
      trendingQb.getMany(),
      this.pointTransactionRepository
        .createQueryBuilder('pt')
        .innerJoin('pt.user', 'pointUser')
        .select(
          `COALESCE(SUM(CASE WHEN pt.points > 0 THEN pt.points ELSE 0 END), 0)`,
          'earned',
        )
        .addSelect(
          `COALESCE(SUM(CASE WHEN pt.points < 0 THEN ABS(pt.points) ELSE 0 END), 0)`,
          'used',
        )
        .where('pointUser.id = :userId', { userId })
        .getRawOne<{ earned: string; used: string }>(),
      activityQb.getMany(),
      eventsQb.getMany(),
    ]);

    const newOfferCutoff = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000,
    );
    const newOffersCount = activeOffers.filter(
      (offer) =>
        offer.created_at && new Date(offer.created_at) >= newOfferCutoff,
    ).length;

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
      location: {
        borough: boroughName,
        city: resolvedLocation.hierarchy.city?.name ?? null,
        highStreet: resolvedLocation.hierarchy.highStreet?.name ?? null,
        localMall: resolvedLocation.hierarchy.localMall?.name ?? null,
        postcode: customerPostcode,
        latitude: resolvedLocation.latitude,
        longitude: resolvedLocation.longitude,
        source: resolvedLocation.source,
      },
      pointsBreakdown,
      liveOffersCount: activeOffers.length,
      newOffersCount,
      activeCampaignsCount: activeCampaigns.length,
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
        businesses: (offer.user?.businesses ?? []).map((b) => b.businessName),
      })),
      events: upcomingEvents.map((event) => ({
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
        businessName: event.business?.businessName ?? null,
        status: event.status,
      })),
    };
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
          relations: ['user', 'user.businesses'],
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
      rewards: activeOffers.map((offer) => ({
        id: offer.id,
        name: offer.name,
        description: offer.description ?? '',
        points: offer.points ?? 0,
        businesses: (offer.user?.businesses ?? []).map((b) => b.businessName),
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
      relations: [
        'category',
        'reviews',
        'reviews.user',
        'user',
        'user.offers',
        'events',
      ],
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
      offers: (business.user?.offers ?? [])
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
    const [spin, scratch, challenges, progress, recentSpins] =
      await Promise.all([
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
        this.spinLedgerRepository.find({
          where: { userId },
          order: { spinDate: 'DESC' },
          take: 120,
        }),
      ]);

    // A streak is the number of consecutive days ending today (or yesterday
    // while today's spin is still unused), based on the real ledger.
    const spinDays = new Set(recentSpins.map((entry) => entry.spinDate));
    const cursor = new Date(`${today}T00:00:00.000Z`);
    if (!spinDays.has(today)) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    let streak = 0;
    while (spinDays.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

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
        streak,
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
